import asyncHandler from "../utils/asynchandler.util.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
import { validatefields } from "../utils/validatereqfields.util.js";
import { Exam } from "../models/exam.model.js";
import mcqGenerator from "../core/mcqGenerator.js";
import { Student } from "../models/student.model.js";
import mongoose from "mongoose";
import { Result } from "../models/result.model.js";
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

    let transformedExams;
    let exam;
    if(req.role=="admin")
    {
        exam=await Exam.aggregate(
            [
                {
                $match: { created_by: new mongoose.Types.ObjectId(req.user) } // Convert req.user to ObjectId
              }
              ,{
                 $lookup: {
                   from: 'results',
                   localField: '_id',
                   foreignField: 'exam',
                   as: 'results'
                 }
               },
               {
                 $unwind: {
                   path: '$results',
                   preserveNullAndEmptyArrays: true // To handle exams with no results
                 }
               },
               {
                 $lookup: {
                   from: 'students',
                   localField: 'results.student',
                   foreignField: '_id',
                   as: 'student'
                 }
               },
               {
                 $group: {
                   _id: '$_id', // Group by exam ID
                   exam: { $first: '$$ROOT' }, // Keep all exam fields
                   total_attended: { $sum: { $cond: [{ $ifNull: ['$results', false] }, 1, 0] } }, // Count results
                   highest_score: { $max: '$results.score' }, // Find the highest score
                   students: { $addToSet: '$results.student' } // Gather unique students
                 }
               },
               {
                 $addFields: {
                   'exam.total_attended': '$total_attended',
                   'exam.highest_score': '$highest_score',
                   'exam.unique_students':{$size:'$students'},
                   'exam.id':'$_id'
                 }
               },
               {
                 $project: {
                   'exam.students': 0, // Optional: Exclude students field
                   'exam.results': 0,
                   'exam.student':0,
                   'exam.questions':0,
                   'exam._id':0,
                   'exam.__v':0,
                   'exam.created_by':0,
                   'exam.updatedAt':0/// Optional: Exclude results field
                 }
               },
               {
                 $replaceRoot: { newRoot: '$exam' } // Flatten the structure to return the exam fields
               }
             ]
        );
        if(exam.length==0)
            {
                throw new Apierror(455,"No Exam Found for admin");
            }
        transformedExams=exam;
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

        transformedExams=Promise.all(

          exam.map(async e=>{
            const examObj = exam.toJSON();
              // Check if isSingleAttempt is true, then determine if it was attempted
            if (examObj.isSingleAttempt) {
            const hasAttempted = await exam.isExamAttempted(student._id);
            examObj.hasAttempted = hasAttempted;
            }
          return examObj;
          })
        );
      }
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
const deactivateExam=asyncHandler(async(req,res)=>{
  const examId = req.params.examId;
  let exam=await Exam.findByIdAndUpdate(examId,{is_active:false},{new:true});
  if (!exam) {
      throw new Apierror(458,'Exam not found');
    }
    return res.status(200).json(new Apiresponse("Exam Deactivated Successfully"));
});

const deleteExam=asyncHandler(async (req,res)=>{

});

const getResults=asyncHandler(async(req,res)=>{
 
  let studentId=req.user;
  let examId=req.params.examId;
  if(req.role=="admin"){
    studentId=req.params.studentId;
  }
  
  let results=await Result.aggregate([
    {
      $match:{student: new mongoose.Types.ObjectId(studentId),
        exam:new mongoose.Types.ObjectId(examId)}
    },
    {
    $lookup:{
      from: "exams",
      localField:"exam",
      foreignField:"_id" ,
      as: "exam"
    }
  },
    {
      $addFields:{
        exam_name:{$arrayElemAt:["$exam.title",0]},
        exam_duration:{$arrayElemAt:["$exam.duration",0]},
        exam_level:{$arrayElemAt:["$exam.level",0]},
        exam_total_question:{$arrayElemAt:["$exam.total_questions",0]},
        exam_marks:{$arrayElemAt:["$exam.total_marks",0]}
        
      }
    },
    {
      $project:
        {
          student:0,
          exam:0,
          __v:0
        }
    }
  ]);

  if(results.length==0)
    {
        throw new Apierror(456,"No Result Found");
    }

    return res.status(200).json(new Apiresponse(results,200));
}
);

const getStudents=asyncHandler(async(req,res)=>{

  let examId=req.params.examId;

  let students=await Result.aggregate(
    [{
        $match:{exam:new mongoose.Types.ObjectId(examId)}
     }
      ,{
        $lookup:
        {
          from: "students",
          localField:"student",
          foreignField:"_id",
          as: "student"
        }
      },
      {
        $unwind:{
          path:"$student"
          }
      },
      {
        $group:{
          _id: "$student._id",
         documents: { $first: "$$ROOT" }
        }
      },
      {
        $project:{
          student_id:"$documents.student._id",
          student_name:"$documents.student.fullname",
          student_email:"$documents.student.email",
          student_level:"$documents.student.level",
          student_class:"$documents.student.sclass",
          student_phoneno:"$documents.student.phone_no",
       }
      }
    ]
  );
  if(students.length==0)
    {
        throw new Apierror(456,"No Student Found");
    }

    return res.status(200).json(new Apiresponse(students,200));
});

export {createExam,getExams,getQuestions,activateExam,deactivateExam,getResults,getStudents};