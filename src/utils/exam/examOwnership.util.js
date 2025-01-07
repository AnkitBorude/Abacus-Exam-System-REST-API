import { Admin } from "../../models/admin.model.js";
import { Exam } from "../../models/exam.model.js";
import { getDocumentIdfromPublicid } from "../publicId/validid.util.js";

export const isAdminOwnerofExam=async (adminId,examId)=>{

    let exam=await Exam.findOne({public_id:examId}).select("created_by");
    let admin=await getDocumentIdfromPublicid(adminId,Admin,"admin");
    if(exam.created_by.equals(admin))
    {
        return true;
    }
    return false;
}