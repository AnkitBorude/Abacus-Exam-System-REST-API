import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import config from "config";
import { MAX_USERNAME_LENGTH,MIN_USERNAME_LENGTH } from "../constants.js";
const studentSchema= new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    username:{
        type:String,
        required:true,
        trim:true,
        minLength:MIN_USERNAME_LENGTH,
        maxLength:MAX_USERNAME_LENGTH,
        unique:true
    },
    email: {
    type: String,
    required: true,
    lowecase: true,
    trim: true, 
    },
    level: {
    type: String,
    required: true
    },
    sclass: {
    type: String,
    required: true
    },
    phone_no: {
    type: String,
    match:[ /^\d{10}$/]
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String,
        default:" "
    }
},{timestamps:true});

studentSchema.set("toJSON",{
    //doc: The original Mongoose document (before conversion). 
    //This includes all the data and Mongoose-specific features (like methods and virtuals).
    //ret: The plain JavaScript object (the result of converting the Mongoose document).
    // This is the object that will be transformed and returned.

    transform:(doc,rec)=>{
        //avoiding this value to be sent along the response back
        delete rec._id;
        delete rec.__v;
        delete rec.createdAt;
        delete rec.updatedAt;
        delete rec.refreshToken;
        delete rec.password;
        return rec;
    }
});

studentSchema.pre("save",async function(next){
    try{
    this.password= await bcrypt.hash(this.password,config.get("Password.saltingRounds"));
    next();
    }
    catch(error)
    {
        next(error);
    }
});
export const Student=mongoose.model("Student",studentSchema);