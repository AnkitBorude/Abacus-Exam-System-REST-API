import mongoose from "mongoose";
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
    unique: true,
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
    validate: {
        validator: function(v) {
        return /\d{10}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
        }
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

export const Student=mongoose.model("Student",studentSchema);