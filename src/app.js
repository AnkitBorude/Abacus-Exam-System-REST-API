import express from 'express';
import dotenv from 'dotenv';
dotenv.config({
    override: true,
});
import { studentRouter } from './routes/student.router.js';
import { adminRouter } from './routes/admin.router.js';
import { examRouter } from './routes/exam.router.js';
import { resultRouter } from './routes/result.router.js';
import process from 'node:process';
import getDbHealth from './db/db.health.js';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from '../logger/index.logger.js';
import cors from 'cors';
import config from 'config';
import Apierror from './utils/apierror.util.js';
const app = express();

var whitelist=process.env.CORS_WHITELIST?.split(",") || [];
console.log(whitelist);
app.use(cors({
    origin:function(origin,callback)
    {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true)
          } else {
            callback(new Apierror(403,'Not allowed by CORS'))
          }      
    },
    allowedHeaders:config.get('CORS.allowedHeaders'),
    methods:config.get('CORS.allowedMethods')
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.use(helmet());
app.use(morgan('common',{
    stream:{
    write:(message)=>logger.http(message)
}
}));

app.use('/api/v1/student', studentRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/exam', examRouter);
app.use('/api/v1/result', resultRouter);

app.get('/echo', (req, res) => {
    res.json({ ...req.body, echoed: true });
});

app.get('/health', async (req, res) => {
    //check the health of the external dependencies

    let health = 'healthy';
    let database = await getDbHealth();
    health = database.health;
    res.json({
        status: health,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version,
        environment: process.env.NODE_ENV,
        database: database,
    });
});

app.use((req, res, next) => {
    logger.warn(`The requested resource ${req.method} ${req.originalUrl} was not found on this server.`);
    res.status(404).json({
        success: false,
        message: `The requested resource ${req.method} ${req.originalUrl} was not found on this server.`,
    });
    return next;
});

app.use((err, req, res, next) => {
    // Handle all other errors
    logger.error(`Internal Error occurred: ${err.message}\n${err.stack}`);
    res.status(err.statusCode || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred.',
        timestamp: new Date(),
        statusCode:err.statusCode || 500,
    });
    return next;
});

export { app };
