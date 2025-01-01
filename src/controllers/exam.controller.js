import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Exam } from '../models/exam.model.js';
import mcqGenerator from '../core/mcqGenerator.js';
import { Student } from '../models/student.model.js';
import { Result } from '../models/result.model.js';
import { HTTP_STATUS_CODES, updateFieldPolicy } from '../constants.js';
import { Admin } from '../models/admin.model.js';
import { getDocumentIdfromPublicid, isValidpublicId } from '../utils/publicId/validid.util.js';
import { getBooleanfromQueryParameter } from '../utils/query/booleanValue.util.js';

const createExam = asyncHandler(async (req, res) => {
    if (req.role == 'admin') {
        if (req.validationError) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                req.validationError
            );
        }

        const { maxTerms, minNumber, maxNumber, operators, total_questions } =
            req.body;
        let qconfig = {
            maxTerms,
            minNumber,
            maxNumber,
            operators,
            total_questions,
        };
        const {
            title,
            duration,
            level,
            total_marks_per_question,
            is_active,
            isSingleAttempt,
        } = req.body;

        let questions = mcqGenerator(
            qconfig,
            total_questions,
            total_marks_per_question
        );

        let docId=await getDocumentIdfromPublicid(req.user,Admin,"admin");
        const exam = new Exam({
            title,
            duration,
            level,
            total_marks: total_questions * total_marks_per_question,
            total_marks_per_question,
            total_questions,
            is_active,
            isSingleAttempt,
            created_by: docId,
            questions: questions,
        });

        await exam.save();
        return res
            .status(200)
            .json(new Apiresponse('Exam Created Successfully'), 200);
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.FORBIDDEN.code,
            'Forbidden cannot create exam'
        );
    }
});

//returns all the exams created by the admin and student by level
const getExams = asyncHandler(async (req, res) => {
    let transformedExams;
    let exam;

    const {title,level,is_active,isSingleAttempt,is_deleted,type}=req.query;

    const query={};

    if(title)
    {
        query.title= { $regex: '^' + title, $options: 'i' };
    }

    if(level)
    {
        query.level=level;
    }
    if(is_active)
    {
        query.is_active= is_active==="true";
    }
    if(is_deleted)
    {
        query.is_deleted= getBooleanfromQueryParameter(is_deleted);
    }
    if(isSingleAttempt || type)
    {
        
        query.isSingleAttempt= getBooleanfromQueryParameter(isSingleAttempt) ||
        getBooleanfromQueryParameter(type);
    }
    if (req.role == 'admin') {
        let docId=await getDocumentIdfromPublicid(req.user,Admin,"admin");
        exam = await Exam.aggregate([
            {
                $match: { created_by: docId,...query}, // Convert req.user to ObjectId
            },
            {
                $lookup: {
                    from: 'results',
                    localField: '_id',
                    foreignField: 'exam',
                    as: 'results',
                },
            },
            {
                $unwind: {
                    path: '$results',
                    preserveNullAndEmptyArrays: true, // To handle exams with no results
                },
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'results.student',
                    foreignField: '_id',
                    as: 'student',
                },
            },
            {
                $group: {
                    _id: '$_id', // Group by exam ID
                    exam: { $first: '$$ROOT' }, // Keep all exam fields
                    total_attended: {
                        $sum: {
                            $cond: [{ $ifNull: ['$results', false] }, 1, 0],
                        },
                    }, // Count results
                    highest_score: { $max: '$results.score' }, // Find the highest score
                    students: { $addToSet: '$results.student' }, // Gather unique students
                },
            },
            {
                $addFields: {
                    'exam.total_attended': '$total_attended',
                    'exam.highest_score': '$highest_score',
                    'exam.unique_students': { $size: '$students' },
                    'exam.exam_id': '$exam.public_id',
                },
            },
            {
                $project: {
                    'exam.students': 0, // Optional: Exclude students field
                    'exam.results': 0,
                    'exam.student': 0,
                    'exam.questions': 0,
                    'exam._id': 0,
                    'exam.__v': 0,
                    'exam.created_by': 0,
                    'exam.updatedAt': 0, /// Optional: Exclude results field
                },
            },
            {
                $replaceRoot: { newRoot: '$exam' }, // Flatten the structure to return the exam fields
            },
        ]);
        if (exam.length == 0) {
            if(query)
            {
                return res.status(200).json(new Apiresponse([],200));
            }
            throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'No Exam Found');
        }
        transformedExams = exam;
    } else {
        let student = await Student.findOne({public_id:req.user});
        let studentLevel = student.level;
        exam = await Exam.find({ level: studentLevel }).populate(
            'created_by',
            'fullname'
        );
        if (exam.length == 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'No Matching Exam Found with level ' + studentLevel
            );
        }

        transformedExams = await Promise.all(
            exam.map(async (e) => {
                const examObj = e.toJSON();
                // Check if isSingleAttempt is true, then determine if it was attempted
                if (e.isSingleAttempt) {
                    //appending the attribute hasAttempted if the exam is single attempt only
                    examObj.hasAttempted = await e.isExamAttempted(student._id);
                }
                //appending attempt counts
                examObj.totalAttempted = await e.countAttempts(student._id);
                return examObj;
            })
        );
    }
    return res.status(200).json(new Apiresponse(transformedExams, 200));
});

const getQuestions = asyncHandler(async (req, res) => {
    const examId = req.params.examId;
    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
    let exam = await Exam.findOne({public_id:examId});
    let questions = exam.questions;
    let transformedQuestions = questions.map((q) => q.toJSON());

    return res.status(200).json(new Apiresponse(transformedQuestions, 200));
});

const activateExam = asyncHandler(async (req, res) => {
    const examId = req.params.examId;
    if(req.role=="admin")
    {
    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
    let exam = await Exam.findOneAndUpdate(
        {public_id:examId},
        { is_active: true },
        { new: true }
    );
    if (!exam) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam not found');
    }
    return res.status(200).json(new Apiresponse('Exam Activated Successfully'));
}else
{
    throw new Apierror(
        HTTP_STATUS_CODES.FORBIDDEN.code,
        'Forbidden cannot Activate exam'
    );
}
});
const deactivateExam = asyncHandler(async (req, res) => {
    const examId = req.params.examId;
    if(req.role=="admin")
    {
    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
    let exam = await Exam.findOneAndUpdate(
        {public_id:examId},
        { is_active: false },
        { new: true }
    );
    if (!exam) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam not found');
    }
    return res
        .status(200)
        .json(new Apiresponse('Exam Deactivated Successfully'));
}else
{
    throw new Apierror(
        HTTP_STATUS_CODES.FORBIDDEN.code,
        'Forbidden cannot Deactivate exam'
    );
}
});

const deleteExam = asyncHandler(async (req, res) => {
    if(req.role=="admin")
    {
    let examId = req.params.examId;
    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
 
    let exam = await Exam.findOne({public_id:examId});
    if (!exam || exam.is_deleted) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam Not found');
    }
    let docId=await getDocumentIdfromPublicid(exam.public_id,Exam,"exam");
    const exists = await Result.findOne({ exam: docId }).lean().select('_id');
    if (exists) {
        exam.is_deleted = true;
        exam.deletedAt = new Date();
        exam.is_active = false;
        exam.questions = [];
        await exam.save();
    } else {
        await Exam.deleteOne({ _id: exam._id });
    }
    res.status(200).json(new Apiresponse('Exam deleted Successfully', 200));
}else{
    throw new Apierror(
        HTTP_STATUS_CODES.FORBIDDEN.code,
        'Forbidden cannot delete exam'
    );
}
});

//returns the results attempted by the studentid passed and creadted by admin with exam detail only
//inflates the exam field
const getResults = asyncHandler(async (req, res) => {

    /**
     * Following Two Endpoints are handled by this controller
     * 1) /:examId/results--> only for student and admin ->>extract student Id from token
     */
    const examId=req.params.examId;
    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }

        let result=[];
        let examDocId=await getDocumentIdfromPublicid(examId,Exam,"exam");
    if(req.role=="admin")
    {
        //admin van view the exams that he is the only owner
      
        //student inflate

        result = await Result.aggregate([
            {
                $match: { exam: examDocId},
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student',
                },
            },

            {
                $unwind: {
                    path: '$student', // Unwinds the array into a single subdocument
                    preserveNullAndEmptyArrays: true, // Optional: Keeps documents without matches
                },
            },
            {
                $addFields: {
                    result_id: '$public_id',
                    'student.student_id': '$student.public_id',
                },
            },
            {
                $project: {
                    __v: 0,
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    exam: 0,
                    public_id:0,
                    'student.password': 0,
                    'student._id': 0,
                    'student.username': 0,
                    'student.refreshToken': 0,
                    'student.createdAt': 0,
                    'student.updatedAt': 0,
                    'student.__v': 0,
                    'student.public_id':0
                },
            },
        ]);


    }else if(req.role=="student")
    {
        let studentDocId=await getDocumentIdfromPublicid(req.user,Student,"student");
        result = await Result.aggregate([
            {
                $match: {
                    student: studentDocId,
                    exam: examDocId,
                },
            },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'exam',
                    foreignField: '_id',
                    as: 'exam',
                },
            },
            {
                $addFields: {
                    result_id: '$public_id',
                },
            },
            {
                $project: {
                    student: 0,
                    exam: 0,
                    __v: 0,
                    _id: 0,
                    public_id:0,
                    createdAt: 0,
                    updatedAt: 0,
                },
            },
        ]);
    }

    if (result.length == 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'No Associated Result Found For this Exam'
        );
    }
    return res.status(200).json(new Apiresponse(result, 200));
});

const getResultsbyStudent=asyncHandler(async (req,res)=>{

    if(req.role=="admin")
    {
    let studentId = req.params.studentId;
    let examId = req.params.examId;
    if(!isValidpublicId(studentId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Student Id'
            );
        }
        if(!isValidpublicId(examId))
            {
                throw new Apierror(
                    HTTP_STATUS_CODES.BAD_REQUEST.code,
                    'Invalid Exam Id'
                );
            }
        let examDocId=await getDocumentIdfromPublicid(examId,Exam,"exam");
        let studentDocId=await getDocumentIdfromPublicid(studentId,Student,"student");

        let results = await Result.aggregate([
            {
                $match: {
                    student: studentDocId,
                    exam: examDocId,
                },
            },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'exam',
                    foreignField: '_id',
                    as: 'exam',
                },
            },
            {
                $addFields: {
                    result_id: '$public_id',
                },
            },
            {
                $project: {
                    student: 0,
                    exam: 0,
                    __v: 0,
                    _id: 0,
                    public_id:0,
                    createdAt: 0,
                    updatedAt: 0,
                },
            },
        ]);
        if (results.length == 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'No Associated Result Found For this Exam'
            );
        }
    
        return res.status(200).json(new Apiresponse(results, 200));
    }else
    {
        //throw unauthorized erro
        throw new Apierror(HTTP_STATUS_CODES.FORBIDDEN.code,"Forbidden cannot access the result");
    }
});
//returning all the results of the exam from examid
//inflates student
const getStudents = asyncHandler(async (req, res) => {
    let examId = req.params.examId;
    if(req.role=="admin")
    {

    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
        let examDocId=await getDocumentIdfromPublicid(examId,Exam,"exam");
    let students = await Result.aggregate([
        {
            $match: { exam:examDocId },
        },
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'student',
            },
        },
        {
            $unwind: {
                path: '$student',
            },
        },
        {
            $group: {
                _id: '$student._id',
                documents: { $first: '$$ROOT' },
            },
        },
        {
            $project: {
                student_id: '$documents.student.public_id',
                fullname: '$documents.student.fullname',
                email: '$documents.student.email',
                level: '$documents.student.level',
                sclass: '$documents.student.sclass',
                phone_no: '$documents.student.phone_no',
                is_deleted: '$documents.student.is_deleted',
                deletedAt: '$documents.student.deletedAt',
                _id: 0,
            },
        },
    ]);
    if (students.length == 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'No Student Found'
        );
    }
    return res.status(200).json(new Apiresponse(students, 200));
}
else
{
    throw new Apierror(
        HTTP_STATUS_CODES.FORBIDDEN.code,
        'Forbidden cannot access student attempted the exam'
    );
}
});

const deleteResults = asyncHandler(async (req, res) => {
    let examId = req.params.examId;

    if(!isValidpublicId(examId))
        {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
    let userId = req.user;
    let exam = await Exam.findOne({public_id:examId});
    //can delete the results even if the exam is deleted
    if (!exam) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam Not found');
    }

    //role based access
    if (req.role == 'admin') {
        let adminDocId=await getDocumentIdfromPublicid(userId,Admin,"admin");
        if (exam.created_by.equals(adminDocId)) {
            let deletedObj = await Result.deleteMany({ exam: exam._id });
            res.status(200).json(
                new Apiresponse(
                    `Admin: Successfully deleted ${deletedObj.deletedCount} results of ${exam.title}`,
                    200
                )
            );
        } else {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Forbidden cannot delete the results'
            );
        }
    } else if (req.role == 'student') {
        let studentDocId=await getDocumentIdfromPublicid(userId,Student,"student");
        let deletedObj = await Result.deleteMany({
            exam: exam._id,
            student: studentDocId,
        });
        res.status(200).json(
            new Apiresponse(
                `Student: Successfully deleted ${deletedObj.deletedCount} results of ${exam.title}`,
                200
            )
        );
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.UNAUTHORIZED.code,
            'Unauthorized Cannot delete'
        );
    }
});

const updateExam = asyncHandler(async (req, res) => {
    if (req.role == 'admin') {
        let examId = req.params.examId;

        if (req.validationError) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                req.validationError
            );
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Request body cannot be empty.'
            );
        }

        if(!isValidpublicId(examId))
            {
                throw new Apierror(
                    HTTP_STATUS_CODES.BAD_REQUEST.code,
                    'Invalid Exam Id'
                );
            }

        let userId = req.user;

        const exists = await Exam.findOne({public_id: examId })
            .lean()
            .select('_id created_by');

        if (!exists) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Exam Not Found'
            );
        }
        let adminDocId=await getDocumentIdfromPublicid(userId,Admin,"admin");
        //check whether the admin is editing the exam which is only created by him
        if (!exists.created_by.equals(adminDocId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Forbidden access to edit details of exam '
            );
        }

        const updatesTobeDone = Object.keys(req.body);

        const invalidFields = updatesTobeDone.filter(
            (key) =>
                !updateFieldPolicy.examEntity.both.includes(key) &&
                !updateFieldPolicy.examEntity.admin.includes(key)
        );

        if (invalidFields.length > 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Invalid or Unauthorized fields. following fields are not allowed: ' +
                    invalidFields.join(' , ')
            );
        }

        await Exam.updateOne(
            { _id: exists._id },
            { $set: { ...req.body } },
            { runValidators: true }
        );

        res.status(200).json(
            new Apiresponse(
                `Exam ${updatesTobeDone.join(' , ')} attributes has been updated Successfully`,
                200
            )
        );
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.UNAUTHORIZED.code,
            'Unauthorized cannot edit the exam details'
        );
    }
});

const generateQuestions = asyncHandler(async (req, res) => {
    //temporary putting the validation error handling out of request handling
    //for testing purpose

    if (req.role == 'admin') {
        if (req.validationError) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                req.validationError
            );
        }
        let examId = req.params.examId;
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Request body cannot be empty.'
            );
        }

        if(!isValidpublicId(examId))
            {
                throw new Apierror(
                    HTTP_STATUS_CODES.BAD_REQUEST.code,
                    'Invalid Exam Id'
                );
            }
        let userId = req.user;

        const exists = await Exam.findOne({public_id: examId })
            .lean()
            .select('_id created_by');

        if (!exists) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Exam Not Found'
            );
        }
        let adminDocId=await getDocumentIdfromPublicid(userId,Admin,"admin");
        //check whether the admin is editing the exam which is only created by him
        if (!exists.created_by.equals(adminDocId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Forbidden access to edit details of exam '
            );
        }

        //in future need to add more validation using the joi
        const updatesTobeDone = Object.keys(req.body);

        const invalidFields = updatesTobeDone.filter(
            (key) =>
                !updateFieldPolicy.questionEntity.both.includes(key) &&
                !updateFieldPolicy.questionEntity.admin.includes(key)
        );

        if (invalidFields.length > 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Invalid or Unauthorized fields. following fields are not allowed: ' +
                    invalidFields.join(' , ')
            );
        }

        let totalQuestions = req.body.total_questions
            ? parseInt(req.body.total_questions)
            : 1;
        let marksPerQuestion = req.body.total_marks_per_question
            ? parseInt(req.body.total_marks_per_question)
            : 1;

        let generatedQuestions = mcqGenerator(
            {
                maxTerms: req.body.maxTerms,
                maxNumber: req.body.maxNumber,
                minNumber: req.body.minNumber,
                operators: req.body.operators,
            },
            totalQuestions,
            marksPerQuestion
        );

        await Exam.updateOne(
            { _id: exists._id },
            {
                questions: generatedQuestions,
                total_questions: totalQuestions,
                total_marks_per_question: marksPerQuestion,
                total_marks: totalQuestions * marksPerQuestion,
            },
            { runValidators: true }
        );
        res.status(200).json(
            new Apiresponse('Questions has been generated successfully', 200)
        );
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.UNAUTHORIZED.code,
            'Unauthorized cannot generate questions of the exam details'
        );
    }
});
export {
    deleteExam,
    createExam,
    getExams,
    getQuestions,
    activateExam,
    deactivateExam,
    getResults,
    getStudents,
    deleteResults,
    updateExam,
    generateQuestions,
    getResultsbyStudent
};
