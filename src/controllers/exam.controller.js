import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import { Exam } from "../models/exam.model.js";
import mcqGenerator from "../core/mcqGenerator.js";

const createExam=asyncHandler(async (req,res)=>{

    const {maxTerms, minNumber, maxNumber, operators,total_questions}=req.body;
    let qconfig={maxTerms, minNumber, maxNumber, operators,total_questions};
    const { title, duration, level,total_marks_per_question, is_active } = req.body;
    
    let validParams=validatefields({...qconfig,...{ title, duration, level,total_marks_per_question, is_active }});

    if(validParams.parameterisNull)
    {
        throw new Apierror(401,validParams.parameterName+" is null or undefined");
    }

    let questions=mcqGenerator(qconfig,total_questions,total_marks_per_question);

    const exam = new Exam({
        title,
        duration,
        level,
        total_marks:total_questions*total_marks_per_question,
        total_marks_per_question,
        total_questions,
        is_active,
        created_by:req.user,
        questions:questions
    });

    const savedExam = await exam.save();

    return res.status(200).json(new Apiresponse(savedExam),200);
});
const deleteExam=asyncHandler(async (req,res)=>{

});
export {createExam};