import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import mcqGenerator from "../core/mcqGenerator.js";

const createExam=asyncHandler(async (req,res)=>{

    const {maxTerms, minNumber, maxNumber, operators,totalQuestions}=req.body;
    let config={maxTerms, minNumber, maxNumber, operators,totalQuestions};
    let validParams=validatefields(config);
    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is null or undefined");
    }
    let questions=mcqGenerator(config,totalQuestions);
    return res.status(200).json(new Apiresponse(questions),200);
});

export {createExam};