//controller for student registration
import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { Student } from "../models/student.model.js";
import { validatefields } from "../utils/validatereqfields.util.js";

const registerStudent=asyncHandler(async (req,res)=>{
    const{fullname,email,username,level,sclass,phone_no,password}=req.body;
    let validParams=validatefields({fullname,email,username,level,sclass,phone_no,password});
    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is are null or undefined");
    }

    try{
    const student=await Student.create({fullname,email,username,level,sclass,phone_no,password});
    const savedStudent=await student.save();
    res.json(new Apiresponse("Student Registration Successfull",200));
    }catch(error)
    {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            throw new Apierror(402,"Username already Exists");
        }
        else if(error.name === 'ValidationError')
        {
            throw new Apierror(402,`The phone number is invalid. It must be exactly 10 digits.`);
        }
        else
        {
        throw new Apierror(402,error.message);
        }
    }

});

const loginStudent=asyncHandler(async (req,res)=>{
    const{username,password}=req.body;
    let validParams=validatefields({username,password});
    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is / are null or undefined");
    }
    let student;//extracting the admin from the db
    try{
        student=await Student.findOne({username});
    }
    catch(error)
    {
        throw new Apierror(402,error.message);
    }
    if(!student)
    {
        throw new Apierror(403,"Student account with provided credentials does not exists");
    }
    if(student.password!==password)
    {
        throw new Apierror(405,"Wrong Password");
    }
    res.status(200).json(new Apiresponse("Login Successfull",200));
});


export {registerStudent,loginStudent};