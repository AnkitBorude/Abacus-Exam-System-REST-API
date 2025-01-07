import express from 'express';
import { studentRouter } from './routes/student.router.js';
import { adminRouter } from './routes/admin.router.js';
import { examRouter } from './routes/exam.router.js';
import { resultRouter } from './routes/result.router.js';
import process from 'node:process';
import getDbHealth from './db/db.health.js';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from '../logger/index.logger.js';
const app = express();

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
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred.',
        timestamp: new Date(),
        statusCode:err.status || 500,
    });
    return next;
});

export { app };
