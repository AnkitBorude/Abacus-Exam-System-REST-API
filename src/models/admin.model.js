import mongoose from "mongoose";
const adminSchema= new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    username:{
        type:String,
        required:true,
        trim:true,
        minLength:8,
        maxLength:16,
        unique:true
    },
    email: {
    type: String,
    required: true,
    unique: true,
    lowecase: true,
    trim: true, 
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

export const Admin=mongoose.model("Admin",adminSchema);