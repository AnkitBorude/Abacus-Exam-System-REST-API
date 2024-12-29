import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Exam } from '../models/exam.model.js';
import mcqGenerator from '../core/mcqGenerator.js';
import { Student } from '../models/student.model.js';
import mongoose from 'mongoose';
import { Result } from '../models/result.model.js';
import { HTTP_STATUS_CODES, updateFieldPolicy } from '../constants.js';

const createExam = asyncHandler(async (req, res) => {
    console.log(req.role);
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

        const exam = new Exam({
            title,
            duration,
            level,
            total_marks: total_questions * total_marks_per_question,
            total_marks_per_question,
            total_questions,
            is_active,
            isSingleAttempt,
            created_by: req.user,
            questions: questions,
        });

        await exam.save();
        return res
            .status(200)
            .json(new Apiresponse('Exam Created Successfully'), 200);
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.UNAUTHORIZED.code,
            'Unauthorized cannot create exam'
        );
    }
});

//returns all the exams created by the admin and student by level
const getExams = asyncHandler(async (req, res) => {
    let transformedExams;
    let exam;
    if (req.role == 'admin') {
        exam = await Exam.aggregate([
            {
                $match: { created_by: new mongoose.Types.ObjectId(req.user) }, // Convert req.user to ObjectId
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
                    'exam.exam_id': '$_id',
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
            throw new Apierror(455, 'No Exam Found for admin');
        }
        transformedExams = exam;
    } else {
        let student = await Student.findById(
            new mongoose.Types.ObjectId(req.user)
        );
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
    let exam = await Exam.findById(examId);
    let questions = exam.questions;
    let transformedQuestions = questions.map((q) => q.toJSON());

    return res.status(200).json(new Apiresponse(transformedQuestions, 200));
});

const activateExam = asyncHandler(async (req, res) => {
    const examId = req.params.examId;
    let exam = await Exam.findByIdAndUpdate(
        examId,
        { is_active: true },
        { new: true }
    );
    if (!exam) {
        throw new Apierror(457, 'Exam not found');
    }
    return res.status(200).json(new Apiresponse('Exam Activated Successfully'));
});
const deactivateExam = asyncHandler(async (req, res) => {
    const examId = req.params.examId;
    let exam = await Exam.findByIdAndUpdate(
        examId,
        { is_active: false },
        { new: true }
    );
    if (!exam) {
        throw new Apierror(458, 'Exam not found');
    }
    return res
        .status(200)
        .json(new Apiresponse('Exam Deactivated Successfully'));
});

const deleteExam = asyncHandler(async (req, res) => {
    let examId = req.params.examId;
    if (!mongoose.Types.ObjectId.isValid(examId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Exam Id'
        );
    }
    examId = new mongoose.Types.ObjectId(examId);
    let exam = await Exam.findById(examId);
    if (!exam || exam.is_deleted) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam Not found');
    }

    const exists = await Result.findOne({ exam: examId }).lean().select('_id');
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
});

//returns the results attempted by the studentid passed and creadted by admin with exam detail only
//inflates the exam field
const getResults = asyncHandler(async (req, res) => {
    let studentId = req.user; //accessign the student id from token if student role
    let examId = req.params.examId;
    const inflate = req.query.inflate;
    let results;
    if (req.role == 'admin') {
        studentId = req.params.studentId; //accessign the student id from params if admin role
    }

    if (inflate == 'student') {
        results = await Result.aggregate([
            {
                $match: { exam: new mongoose.Types.ObjectId(examId) },
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
                    result_id: '$_id',
                    'student.student_id': '$student._id',
                },
            },
            {
                $project: {
                    __v: 0,
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    exam: 0,
                    'student.password': 0,
                    'student._id': 0,
                    'student.username': 0,
                    'student.refreshToken': 0,
                    'student.createdAt': 0,
                    'student.updatedAt': 0,
                    'student.__v': 0,
                },
            },
        ]);
    } else {
        results = await Result.aggregate([
            {
                $match: {
                    student: new mongoose.Types.ObjectId(studentId),
                    exam: new mongoose.Types.ObjectId(examId),
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
                    result_id: '$_id',
                },
            },
            {
                $project: {
                    student: 0,
                    exam: 0,
                    __v: 0,
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                },
            },
        ]);
    }

    if (results.length == 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'No Associated Result Found For this Exam'
        );
    }

    return res.status(200).json(new Apiresponse(results, 200));
});

//returning all the results of the exam from examid
//inflates student
const getStudents = asyncHandler(async (req, res) => {
    let examId = req.params.examId;

    let students = await Result.aggregate([
        {
            $match: { exam: new mongoose.Types.ObjectId(examId) },
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
                student_id: '$documents.student._id',
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
});

const deleteResults = asyncHandler(async (req, res) => {
    let examId = req.params.examId;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Exam Id'
        );
    }
    examId = new mongoose.Types.ObjectId(examId);
    let userId = new mongoose.Types.ObjectId(req.user);
    let exam = await Exam.findById(examId);
    //can delete the results even if the exam is deleted
    if (!exam) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Exam Not found');
    }

    //role based access
    if (req.role == 'admin') {
        console.log('admin requested to delete exam ' + examId + 'Results ');
        if (exam.created_by.equals(userId)) {
            let deletedObj = await Result.deleteMany({ exam: exam._id });
            res.status(200).json(
                new Apiresponse(
                    `Admin: Successfully deleted ${deletedObj.deletedCount} results of ${exam.title}`,
                    200
                )
            );
        } else {
            throw new Apierror(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                'Unauthorized cannot delete the results'
            );
        }
    } else if (req.role == 'student') {
        console.log('admin requested to delete exam ' + examId + 'Results ');
        let deletedObj = await Result.deleteMany({
            exam: exam._id,
            student: userId,
        });
        res.status(200).json(
            new Apiresponse(
                `Student: Successfully deleted ${deletedObj.deletedCount} results of ${exam.title}`,
                200
            )
        );
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_ACCEPTABLE.code,
            'Cannot delete'
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

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
        examId = new mongoose.Types.ObjectId(examId);
        let userId = new mongoose.Types.ObjectId(req.user);

        const exists = await Exam.findOne({ _id: examId })
            .lean()
            .select('_id created_by');

        if (!exists) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Exam Not Found'
            );
        }

        //check whether the admin is editing the exam which is only created by him
        if (!exists.created_by.equals(userId)) {
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

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Exam Id'
            );
        }
        examId = new mongoose.Types.ObjectId(examId);
        let userId = new mongoose.Types.ObjectId(req.user);

        const exists = await Exam.findOne({ _id: examId })
            .lean()
            .select('_id created_by');

        if (!exists) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Exam Not Found'
            );
        }

        //check whether the admin is editing the exam which is only created by him
        if (!exists.created_by.equals(userId)) {
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
};
