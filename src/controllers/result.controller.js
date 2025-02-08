import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Result } from '../models/result.model.js';
import { getPdf } from './pdf.controller.js';
import { flattenObject } from '../utils/flattenObject.util.js';
import { Pdftemplet } from '../utils/pdf/pdf.class.js';
import { HTTP_STATUS_CODES } from '../constants.js';
import { Exam } from '../models/exam.model.js';
import {
    getDocumentIdfromPublicid,
    isValidpublicId,
} from '../utils/publicId/validid.util.js';
import { Student } from '../models/student.model.js';
import { validateResultBody, validateResultDatawithExam } from '../utils/result/validateResult.util.js';

const createResult = asyncHandler(async (req, res) => {
    if(req.role=="student")
    {
    const { score, time_taken, total_correct, date_completed, exam } = req.body;

    //validating the result
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Request body cannot be empty.'
        );
    }
    //validating result body
    validateResultBody(req.body);

    let dbexam = await Exam.findOne({ public_id: exam }).select(
        'duration _id level total_marks total_questions is_deleted total_marks_per_question isSingleAttempt is_active'
    ).lean();

    if (!dbexam || dbexam.is_deleted) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam Not found');
    }

    let student =await Student.findOne({public_id:req.user}).select("_id level").lean();
 
    if(student.level!=dbexam.level)
        {
            throw new Apierror(HTTP_STATUS_CODES.FORBIDDEN.code,`Cannot Create result of exam level:${exam.level} for student level:${student.level}`);
        }

        //if the assessment exam is been already attempted by student
    if(dbexam.isSingleAttempt)
    {
        let resultCount=await Result.countDocuments({exam:dbexam._id,student:student._id});
        if(resultCount>0)
        {
            throw new Apierror(HTTP_STATUS_CODES.CONFLICT.code,"Cannot create result already attempted exam");
        }
    }
    
   
    validateResultDatawithExam(req.body,dbexam);
    let examDocId = dbexam._id;
    let studentDocId = student._id;
    const result = new Result({
        score,
        time_taken,
        total_correct,
        date_completed, //will store the date in UTC thus will make need to append +5:30 each time
        exam: examDocId,
        student: studentDocId,
    });
    await result.save();
    return res
        .status(200)
        .json(new Apiresponse('Result created Successfully', 200));
}else
{
    throw new Apierror(HTTP_STATUS_CODES.FORBIDDEN.code,"Admin Cannot create result explicitly");
}
});

const getResult = asyncHandler(async (req, res) => {
    let resultId = req.params.resultId;
  
    if (!isValidpublicId(resultId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Result Id'
        );
    }
    let query={public_id:resultId};
    if(req.role=="student")
    {
        let student=await getDocumentIdfromPublicid(req.user,Student,"STUDENT");
        query.student=student;
    }
    let result = await Result.findOne(query)
        .populate(
            'student exam',
            'fullname username email sclass level phone_no title duration total_questions total_marks total_marks_per_question public_id'
        )
        .select('-_id -__v')
        .select('+createdAt');
    if (!result) {
        throw new Apierror(HTTP_STATUS_CODES.GONE.code, 'Result Not Found');
    }
    //check if the given route is the pdf route then
    //process the pdf
    let jsonResult = result.toJSON();
    //masking public id
    jsonResult.resultId=jsonResult.public_id;
    delete jsonResult.public_id;
    delete jsonResult.student.student_id;
    if (req.query.format == 'pdf') {
        let myarray = flattenObject(jsonResult);
        //capitalizign the first word and replacing the_ and . with space.
        for (let item of myarray) {
            let userpoint = item[0];
            const firstLetter = userpoint.charAt(0);
            const firstLetterCap = firstLetter.toUpperCase();
            const remainingLetters = userpoint.slice(1);
            let capitalizedWord = firstLetterCap + remainingLetters;
            capitalizedWord = capitalizedWord
                .replaceAll('.', ' ')
                .replaceAll('_', ' ');
            item[0] = capitalizedWord;
        }
        if (result.createdAt != null || result.createdAt != undefined) {
            let date = new Date(result.createdAt).toLocaleDateString();
            let time = new Date(result.createdAt).toLocaleTimeString();

            myarray.push(['Result Date', date + ' ' + time]);
        }
        let templet = new Pdftemplet(
            'Student Result',
            result.exam.title,
            req.username,
            resultId,
            null,
            myarray
        );

        getPdf(req, res, templet);
    } else {
        res.status(200).json(new Apiresponse(jsonResult, 200));
    }
});

const deleteResult = asyncHandler(async (req, res) => {

    //todo do not let student to delete result of assessment exam
    let resultId = req.params.resultId;
    if (!isValidpublicId(resultId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Result Id'
        );
    }
    let query={ public_id: resultId };
    if(req.role=="student")
    {
        let student=await getDocumentIdfromPublicid(req.user,Student,"Student");
        query.student=student;
    }
    let deleteObj=await Result.deleteOne(query);
    if(deleteObj.deletedCount<1)
    {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'Result Not found'
        );
    }
    res.status(200).json(new Apiresponse(`Result Deleted Successfully`, 200));
});
export { createResult, getResult, deleteResult };
