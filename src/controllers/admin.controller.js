//controller for admin registration
import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { Admin } from "../models/admin.model.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import signToken from "../utils/jwttoken.util.js";

const registerAdmin=asyncHandler(async (req,res)=>{
    const{fullname,email,username,password}=req.body;
    let validParams=validatefields({fullname,email,username,password});
    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is null or undefined");
    }

    try{
    const admin=await Admin.create({fullname,email,username,password});
    await admin.save();
    res.json(new Apiresponse("Admin Registration Successfull",200));
    }catch(error)
    {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            throw new Apierror(402,"Username already Exists");
        }
        else
        {
        throw new Apierror(402,error.message);
        }
    }

});
const loginAdmin=asyncHandler(async (req,res)=>{
    const{username,password}=req.body;

    let validParams=validatefields({username,password});

    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is are null or undefined");
    }

    let admin;//extracting the admin from the db
    try{
        admin=await Admin.findOne({username});
    }
    catch(error)
    {
        throw new Apierror(402,error.message);
    }
    if(!admin)
    {
        throw new Apierror(403,"Admin account with provided credentials does not exists");
    }
    if(admin.password!==password)
    {
        throw new Apierror(405,"Wrong Password");
    }
    //generating access token
    const jwtToken=await signToken({adminId:admin._id});

    res.status(200).json(new Apiresponse({message:"Login Successfull",token:jwtToken},200));
});
export {registerAdmin,loginAdmin};