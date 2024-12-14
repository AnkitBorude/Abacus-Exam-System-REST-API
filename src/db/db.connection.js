import mongoose from 'mongoose';
import config from 'config';
import chalk from 'chalk';
import getDbHealth from './db.health.js';
import process from "node:process";
export async function getConnection() {
    try {
        let connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_CONNECTION_URL}/${config.get('DB.name')}`
        );
        console.log(chalk.greenBright(`MongoDB Database Connected :}`));
        let responseTime = (await getDbHealth()).responseTime;
        console.log(
            chalk.blueBright('Database Response Time:' + responseTime + ' ms')
        );
        return connectionInstance;
    } catch (error) {
        console.log(chalk.redBright('MongoDB Connection Failed : ' + error));
        throw error;
    }
}
mongoose.connection.on('connecting', () =>
    console.log(chalk.yellowBright('MongoDB connecting...'))
);
mongoose.connection.on('connected', () =>
    console.log(chalk.greenBright('MongoDB connected'))
);
mongoose.connection.on('open', () =>
    console.log(chalk.greenBright('MongoDB connection open'))
);
mongoose.connection.on('disconnected', () =>
    console.log(chalk.redBright('MongoDB disconnected'))
);
mongoose.connection.on('reconnected', () =>
    console.log(chalk.greenBright('MongoDB reconnected'))
);
mongoose.connection.on('disconnecting', () =>
    console.log(chalk.yellowBright('MongoDB disconnecting....'))
);
mongoose.connection.on('close', () =>
    console.log(chalk.yellowBright('MongoDB close'))
);
