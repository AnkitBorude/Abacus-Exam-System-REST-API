import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import { Result } from "../models/result.model.js";
import { getPdf} from "./pdf.controller.js";
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
    let result=await Result.findById(resultId).populate("student exam","fullname username email sclass level phone_no title duration total_questions total_marks total_marks_per_question").select("-_id -__v").select("+createdAt");
    }
    catch(error)
    {
        throw new Apierror(400,"Error while fetch data"+error.message);
    }
    
    //check if the given route is the pdf route then
    //process the pdf
    if(req.path.endsWith("/pdf"))
    {
        let myarray=flattenObject(result.toJSON());
        //capitalizign the first word and replacing the_ and . with space.
        for (let item of myarray){
        let userpoint=item[0];
        const firstLetter = userpoint.charAt(0)
        const firstLetterCap = firstLetter.toUpperCase()
        const remainingLetters = userpoint.slice(1)
        let capitalizedWord = firstLetterCap + remainingLetters
        capitalizedWord=capitalizedWord.replaceAll("."," ").replaceAll("_"," ");
        item[0]=capitalizedWord;
        
        }
        if(result.createdAt!=null || result.createdAt!=undefined)
        {
        let date= new Date(result.createdAt).toLocaleDateString();
        let time = new Date(result.createdAt).toLocaleTimeString();
  
        myarray.push(["Result Date",date+" "+time]);
        }
        let templet=new Pdftemplet("Student Result",result.exam.title,req.username,resultId,null,myarray);
        
        getPdf(req,res,templet);
    }
    else
    {
        res.status(200).json(new Apiresponse(myarray,200));
    }
    
});
export {createResult,getResultpdf};