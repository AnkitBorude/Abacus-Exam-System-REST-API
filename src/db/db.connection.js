import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import  config  from "config";
import chalk from "chalk";
export async function getConnection(){
    try{
        let connectionInstance=await mongoose.connect(`${process.env.MONGODB_CONNECTION_URL}/${config.get("DB.name")}`);
        console.log(chalk.greenBright(`MongoDB Database Connected :}`));
        return connectionInstance;
    }
    catch(error)
    {
        console.log(chalk.redBright("MongoDB Connection Failed : "+error));
        throw error;
    }

}
mongoose.connection.on('connecting',() => console.log(chalk.yellowBright('MongoDB connecting...')));
mongoose.connection.on('connected', () => console.log(chalk.greenBright('MongoDB connected')));
mongoose.connection.on('open', () => console.log(chalk.greenBright('MongoDB connection open')));
mongoose.connection.on('disconnected', () => console.log(chalk.redBright('MongoDB disconnected')));
mongoose.connection.on('reconnected', () => console.log(chalk.greenBright('MongoDB reconnected')));
mongoose.connection.on('disconnecting', () => console.log(chalk.yellowBright('MongoDB disconnecting....')));
mongoose.connection.on('close', () => console.log(chalk.yellowBright('MongoDB close')));