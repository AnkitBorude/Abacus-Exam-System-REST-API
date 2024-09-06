import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
export async function getConnection(){
    try{
        console.log("Connecting to MongoDB Database...");
        const connectioInstance=await mongoose.connect(`${process.env.MONGODB_CONNECTION_URL}/${DB_NAME}`);
        console.log(`MongoDB Database Connected :}`);
    }
    catch(error)
    {
        console.log("MongoDB Connection Failed : ");
        throw error;
    }

}