import mongoose from 'mongoose';
import process from 'node:process';
import getDbHealth from './db.health.js';
import { logger } from '../../logger/index.logger.js';
export async function getConnection() {
    try {
        let connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_CONNECTION_URL}`,
            {
                serverSelectionTimeoutMS:2000
            }
        );
        logger.info(`MongoDB Database Connected :}`);
        let responseTime = (await getDbHealth()).responseTime;
        logger.info('Database Response Time:' + responseTime + ' ms');
        return connectionInstance;
    } catch (error) {
        throw "MongoDB Error Message:"+error.message;
    }
}
mongoose.connection.on('connecting', () =>
   logger.verbose('MongoDB connecting...')
);
mongoose.connection.on('connected', () =>
   logger.verbose('MongoDB connected')
);
mongoose.connection.on('open', () =>
    logger.verbose('MongoDB connection open')
);
mongoose.connection.on('disconnected', () =>
    logger.verbose('MongoDB disconnected')
);
mongoose.connection.on('reconnected', () =>
    logger.verbose('MongoDB reconnected')
);
mongoose.connection.on('disconnecting', () =>
    logger.verbose('MongoDB disconnecting....')
);
mongoose.connection.on('close', () =>
    logger.verbose('MongoDB close')
);
