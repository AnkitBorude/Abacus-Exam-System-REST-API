import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import  config  from "config";
export async function getConnection(){
    try{
        console.log("Connecting to MongoDB Database...");
        const connectioInstance=await mongoose.connect(`${process.env.MONGODB_CONNECTION_URL}/${config.get("DB.name")}`);
        console.log(`MongoDB Database Connected :}`);
    }
    catch(error)
    {
        console.log("MongoDB Connection Failed : ");
        throw error;
    }

}