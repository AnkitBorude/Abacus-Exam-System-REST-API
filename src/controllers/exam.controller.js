import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import { Exam } from "../models/exam.model.js";
import mcqGenerator from "../core/mcqGenerator.js";
import { Student } from "../models/student.model.js";

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

    return res.status(200).json(new Apiresponse("Exam Created Successfully"),200);
});

//returns all the exams created by the admin and student by level
const getExams=asyncHandler(async(req,res)=>{

    let exam;
    if(req.role=="admin")
    {
        exam=await Exam.find({created_by:req.user});
        if(exam.length==0)
            {
                throw new Apierror(455,"No Exam Found for admin");
            }
    }
    else
    {
        let student=await Student.findById(req.user);
        let studentLevel=student.level;
        exam=await Exam.find({level:studentLevel}).populate('created_by','fullname');
        if(exam.length==0)
        {
            throw new Apierror(456,"No Matching Exam Found with level "+studentLevel);
        }
    }
    const transformedExams = exam.map(e => e.toJSON());
    return res.status(200).json(new Apiresponse(transformedExams,200));
});

const getQuestions=asyncHandler(async(req,res)=>{
    const examId = req.params.examId;
    let exam=await Exam.findById(examId);
    let questions=exam.questions;
    let transformedQuestions = questions.map(q => q.toJSON());

    return res.status(200).json(new Apiresponse(transformedQuestions,200));
});

const activateExam=asyncHandler(async(req,res)=>{
    const examId = req.params.examId;
    let exam=await Exam.findByIdAndUpdate(examId,{is_active:true},{new:true});
    if (!exam) {
        throw new Apierror(457,'Exam not found');
      }
      return res.status(200).json(new Apiresponse("Exam Activated Successfully"));
});
const deleteExam=asyncHandler(async (req,res)=>{

});
export {createExam,getExams,getQuestions,activateExam};