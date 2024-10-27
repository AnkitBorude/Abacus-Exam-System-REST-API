import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import  config  from "config";
import chalk from "chalk";
export async function getConnection(){
    try{
        console.log(chalk.yellowBright("Connecting to MongoDB Database..."));
        const connectioInstance=await mongoose.connect(`${process.env.MONGODB_CONNECTION_URL}/${config.get("DB.name")}`);
        console.log(chalk.greenBright(`MongoDB Database Connected :}`));
    }
    catch(error)
    {
        console.log(chalk.redBright("MongoDB Connection Failed : "+error));
        throw error;
    }

}