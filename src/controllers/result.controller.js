import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import { Result } from "../models/result.model.js";
import { generatePDF } from "./pdf.controller.js";
import mongoose from "mongoose";
import { flattenObject } from "../utils/flattenObject.util.js";
import { Pdftemplet } from "../pdftemplets/pdf.class.js";

const createResult=asyncHandler(async(req,res)=>{
 const { score, time_taken, total_correct, date_completed,exam } = req.body;
 let validParams=validatefields({ score, time_taken, total_correct, date_completed,exam });
    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is null or undefined");
    }

    const result = new Result({
        score,
        time_taken,
        total_correct,
        date_completed,//will store the date in UTC thus will make need to append +5:30 each time
        exam,
        student:req.user
    });
    const finalresult=await result.save();
    return res.status(200).json(new Apiresponse("Result created Successfully",200));
});

const getResultpdf=asyncHandler(async(req,res)=>{
    let resultId=new mongoose.Types.ObjectId(req.params.resultId);

    try{
    let result=await Result.findById(resultId).populate("student exam","fullname username email sclass level phone_no title duration total_questions total_marks total_marks_per_question").select("-_id -__v");
    let myarray=flattenObject(result.toJSON());
    //res.status(200).json(new Apiresponse(result,200));
    let templet=new Pdftemplet("Student Result",result.exam.title,"Ankit Borude","123",null,myarray);
    req.pdfTemplet=templet;
    generatePDF(req,res);
    }
    catch(error)
    {
        throw new Apierror("400",error.message);
    }
    //generatePDF(req,res);
});
export {createResult,getResultpdf};