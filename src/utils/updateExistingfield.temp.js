import mongoose from "mongoose";
import { Exam
 } from "../models/exam.model.js";
 import { Result } from "../models/result.model.js";
 import { Student } from "../models/student.model.js";
 import { Admin
  } from "../models/admin.model.js";
import { generatePublicId } from "./generatePublicid.util.js";

const updateAll=async()=>
{
    console.log("inside the call");
    try{


    await mongoose.connect("mongodb://localhost:27017/CodingExam");
    console.log("connected");

    let exams=await Exam.find({ public_id: { $exists: false } });
    let results=await Result.find({ public_id: { $exists: false } });
    let students=await Student.find({ public_id: { $exists: false } });
    let admin=await Admin.find({ public_id: { $exists: false } });

    const update1=exams.map(async (doc)=>{
        let newId=generatePublicId("exam");
        console.log("newID"+newId);
        return Exam.updateOne({_id:doc._id},{ public_id:newId})
    });
    const update2=results.map(async (doc)=>{
        let newId=generatePublicId("result");
        console.log("newID"+newId);
        return Result.updateOne({_id:doc._id},{ public_id:newId})
    });
    const update3=students.map(async (doc)=>{
        let newId=generatePublicId("student");
        console.log("newID"+newId);
        return Student.updateOne({_id:doc._id},{ public_id:newId})
    });
    const update4=admin.map(async (doc)=>{
        let newId=generatePublicId("admin");
        console.log("newID"+newId);
        return Admin.updateOne({_id:doc._id},{ public_id:newId})
    });

    Promise.all(update1);
    Promise.all(update2);
    Promise.all(update3);
    Promise.all(update4);
    }catch(error)
    {
        console.log(error);
    }
}
updateAll();