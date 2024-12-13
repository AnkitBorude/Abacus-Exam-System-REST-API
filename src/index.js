import dotenv from 'dotenv';
import process from 'node:process';
dotenv.config({
    override: true,
});
import { app } from './app.js';
import { getConnection } from './db/db.connection.js';
import { startLocalmongoDBserver } from './utils/localhost-mongodb.start.js';
import os from 'node:os';
import config from 'config';
import chalk from 'chalk';
import getDbHealth from './db/db.health.js';
let server;
let mongoDatabaseInstance;
try {
    console.log(chalk.greenBright('Starting Server Initialization...'));
    logServerStart();
    console.log('='.repeat(50));
    //start localhost mongodb service
    if (config.util.getEnv('NODE_ENV') == 'development') {
        try {
            console.log(
                chalk.yellowBright(
                    'Development Server: Executing MongoDB  service startup script'
                )
            );
            await startLocalmongoDBserver();
        } catch (error) {
            console.log(chalk.redBright(error));
            console.log(
                chalk.bgYellowBright(
                    chalk.redBright(
                        'Try to manually start the mongodb service from system through command line'
                    )
                )
            );
        }
    } else {
        console.log(
            chalk.yellowBright(
                'Production Server: Connecting to MongoDB server on enviroment url...'
            )
        );
    }
    //connecting to database
    mongoDatabaseInstance = await getConnection();
    console.log(chalk.cyan('='.repeat(50)));
    server = app.listen(config.get('Application.Port'), () => {
        console.log(
            chalk.yellowBright(
                `Server is running on port ${config.get('Application.Port')}`
            )
        );
        if (config.util.getEnv('NODE_ENV') == 'development') {
            console.log(
                chalk.greenBright(
                    `Listening on Localhost -->  http://localhost:${config.get('Application.Port')}`
                )
            );
            console.log(
                chalk.cyanBright(
                    `Listening on  Network   -->  http://${getIpAddresses()[0]?.address}:${config.get('Application.Port')}`
                )
            );
        } else {
            console.log(`http://localhost:${config.get('Application.Port')}`);
        }
        console.log(
            chalk.bgGreen(chalk.blueBright('Successfully started server'))
        );
        console.log('-'.repeat(50));
    });

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

    process.on('SIGINT', () => gracefullShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefullShutdown('SIGTERM'));
    process.on('SIGQUIT', () => gracefullShutdown('SIGQUIT'));
} catch (error) {
    gracefullShutdown('UnCaughtException');
    console.log(error);
    process.exit(1);
    //printing error on log/
}

function logServerStart() {
    console.log('='.repeat(50));
    console.log(`Server Startup - ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Node.js Version: ${process.version}`);
    console.log(`OS: ${os.type()} ${os.release()}`);
    console.log(`Processor Architecture: ${os.arch()}`);
    console.log(
        `Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    );
    console.log(
        `Available Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    );
    console.log('='.repeat(50));
}

function getIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && iface.internal == false) {
                addresses.push(iface);
            }
        }
    }
    return addresses;
}

function gracefullShutdown(signal) {
    console.log(
        chalk.yellowBright(`Received ${signal}.\nStarting graceful shutdown...`)
    );
    server.close(async () => {
        await mongoDatabaseInstance.disconnect();
        console.log(chalk.greenBright('HTTP server closed.'));
    });
}
