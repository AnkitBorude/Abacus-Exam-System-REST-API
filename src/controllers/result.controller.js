import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import { Result } from "../models/result.model.js";

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

export {createResult};