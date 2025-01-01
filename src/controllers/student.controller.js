//controller for student registration
import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Student } from '../models/student.model.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from '../utils/jwttoken.util.js';
import { HTTP_STATUS_CODES, updateFieldPolicy } from '../constants.js';
import { Result } from '../models/result.model.js';
import Joi from 'joi';
import {
    getDocumentIdfromPublicid,
    isValidpublicId,
} from '../utils/publicId/validid.util.js';

const registerStudent = asyncHandler(async (req, res) => {
    if (req.validationError) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            req.validationError
        );
    }
    const { fullname, email, username, level, sclass, phone_no, password } =
        req.body;

    try {
        const student = await Student.create({
            fullname,
            email,
            username,
            level,
            sclass,
            phone_no,
            password,
        });
        await student.save();
        res.status(201).json(
            new Apiresponse('Student Registration Successfull', 201)
        );
    } catch (error) {
        if (
            error.code === 11000 &&
            error.keyPattern &&
            error.keyPattern.username
        ) {
            throw new Apierror(
                HTTP_STATUS_CODES.CONFLICT.code,
                'Username already Exists'
            );
        } else {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                error.message
            );
        }
    }
});

const loginStudent = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const { error } = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).max(128).required().messages({
            'string.min': 'password must be at least 8 characters long.',
            'string.max': 'password must not exceed 128 characters.',
        }),
    })
        .options({ allowUnknown: false })
        .validate(req.body);
    if (error) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            error.details[0].message
        );
    }
    //extracting the student from the db

    let student = await Student.findOne({ username }).select(
        '_id is_deleted password username refreshToken public_id'
    );
    if (!student || student.is_deleted) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'Student does not exists'
        );
    }
    if (!(await student.comparePassword(password))) {
        if (student.password != password) {
            //implemented temporary for old legacy passwords until all passwords are not reseted and rehashed
            throw new Apierror(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                'Wrong Password'
            );
        }
    }
    //adding Access jwt token
    const token = await signAccessToken({
        studentId: student.public_id,
        role: 'student',
        username: student.username,
    });
    //adding Refresh jwt token

    const refreshToken = await signRefreshToken({
        //sending student username intot the refresh token
        username: student.username,
        role: 'student',
    });

    //storing refreshToken in db
    student.refreshToken = refreshToken;
    await student.save();

    return res
        .status(200)
        .json(
            new Apiresponse(
                { message: 'Login Successfull', token: token, refreshToken },
                200
            )
        );
});

const getCurrentstudent = asyncHandler(async (req, res) => {
    try {
        let student = await Student.findOne({ public_id: req.user }).select(
            '-deletedAt -is_deleted'
        );
        if (!student || student.is_deleted) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Student Not Found'
            );
        }
        student = student.toJSON();
        return res.status(200).json(new Apiresponse(student, 200));
    } catch (error) {
        throw new Apierror(HTTP_STATUS_CODES.BAD_REQUEST.code, error.message);
    }
});

/**
 * Returns the student by the query parameter by the level and class
 * and returns by the name query parameter passed by name starts with the
 * given query string name
 */
const getStudents = asyncHandler(async (req, res) => {
    if (req.role == 'admin') {
        const { class: classQuery, level, name } = req.query;

        const query = {};
        if (classQuery) {
            query.sclass = classQuery;
        }
        if (level) {
            query.level = level;
        }
        if (name) {
            query.fullname = { $regex: '^' + name, $options: 'i' };
        } //regex to search the fullname starts with the query string name passed with
        let students = null;
        try {
            students = await Student.find(query).select(
                '-password -refreshToken -__v'
            );
        } catch (error) {
            throw new Apierror(489, error.message);
        }
        if (students.length == 0) {
            throw new Apierror(490, 'No students found');
        }

        return res.status(200).json(
            new Apiresponse(
                students.map((s) => s.toJSON()),
                200
            )
        );
    } else {
        throw new Apierror(HTTP_STATUS_CODES.FORBIDDEN.code, 'Forbidden');
    }
});

const deleteStudent = asyncHandler(async (req, res) => {
    //performing soft delete and hard delete of the student
    if (req.role == 'admin') {
        let studentId = req.params.studentId;
        if (!isValidpublicId(studentId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Student Id'
            );
        }
        let student = await Student.findOne({ public_id: studentId });
        if (!student || student.is_deleted) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Student Not found'
            );
        }
        let docId = await getDocumentIdfromPublicid(
            studentId,
            Student,
            'student'
        );
        const exists = await Result.findOne({ student: docId })
            .lean()
            .select('_id');
        if (exists) {
            //soft delete
            student.is_deleted = true;
            student.deletedAt = new Date();
            //making the soft deleted students username reusable
            student.username = student.username + 'deletedAt' + Date.now();
            await student.save();
        } else {
            //hard delete
            await Student.deleteOne({ public_id: studentId });
        }
        res.status(200).json(
            new Apiresponse(`Student deleted Successfully`, 200)
        );
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.FORBIDDEN.code,
            'Forbidden Access'
        );
    }
});

const deleteStudentAllRecord = asyncHandler(async (req, res) => {
    //remove all the results;
    //remove the whole student
    if (req.role == 'admin') {
        let studentId = req.params.studentId;
        if (!isValidpublicId(studentId)) {
            throw new Apierror(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                'Invalid Student Id'
            );
        }

        let student = await Student.findOne({ public_id: studentId });
        if (!student) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Student Not found'
            );
        }
        let docId = await getDocumentIdfromPublicid(
            studentId,
            Student,
            'student'
        );
        //delete all associated results
        let deletedObj = await Result.deleteMany({ student: docId });
        //delete the student
        await Student.deleteOne({ public_id: studentId });

        res.status(200).json(
            new Apiresponse(
                `Student and associated ${deletedObj.deletedCount} records deleted Successfully`,
                200
            )
        );
    } else {
        throw new Apierror(
            HTTP_STATUS_CODES.FORBIDDEN.code,
            'Forbidden Access'
        );
    }
});

const updateStudent = asyncHandler(async (req, res) => {
    let studentId = req.params.studentId;

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
    if (!isValidpublicId(studentId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Student Id'
        );
    }

    //check the role
    if (req.role == 'student') {
        //1 check student exists

        let student = await Student.findOne({
            public_id: studentId,
            is_deleted: false,
        })
            .lean()
            .select('public_id');
        if (!student) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Student Not Found'
            );
        }

        //2 check whether the student is updating is own details or not

        if (!student.public_id == req.user) {
            throw new Apierror(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                'Unauthorized access to edit details of other student'
            );
        }

        //3 filter out the invalid fields sent in the request body

        const updatesTobeDone = Object.keys(req.body);

        const invalidFields = updatesTobeDone.filter(
            (key) =>
                !updateFieldPolicy.studentEntity.both.includes(key) &&
                !updateFieldPolicy.studentEntity.student.includes(key)
        );

        if (invalidFields.length > 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Invalid or Unauthorized fields. following fields are not allowed: ' +
                    invalidFields.join(' , ')
            );
        }

        await Student.updateOne(
            { public_id: student.public_id },
            { $set: { ...req.body } },
            { runValidators: true }
        );

        res.status(200).json(
            new Apiresponse(
                `Student ${updatesTobeDone.join(' , ')} attributes has been updated Successfully`,
                200
            )
        );
    } else if (req.role == 'admin') {
        let student = await Student.findOne({
            public_id: studentId,
            is_deleted: false,
        })
            .lean()
            .select('public_id');
        if (!student) {
            throw new Apierror(
                HTTP_STATUS_CODES.NOT_FOUND.code,
                'Student Not Found'
            );
        }

        const updatesTobeDone = Object.keys(req.body);

        const invalidFields = updatesTobeDone.filter(
            (key) =>
                !updateFieldPolicy.studentEntity.both.includes(key) &&
                !updateFieldPolicy.studentEntity.admin.includes(key)
        );

        if (invalidFields.length > 0) {
            throw new Apierror(
                HTTP_STATUS_CODES.FORBIDDEN.code,
                'Invalid or Unauthorized fields. following fields are not allowed: ' +
                    invalidFields.join(' , ')
            );
        }

        await Student.updateOne(
            { public_id: student.public_id },
            { $set: { ...req.body } },
            { runValidators: true }
        );

        res.status(200).json(
            new Apiresponse(
                `Following Student attribute: ${updatesTobeDone.join(' , ')} has been updated Successfully`,
                200
            )
        );
    }
});

const regenerateAccessToken = asyncHandler(async (req, res) => {
    //check whether the body is not empty
    //validate body has valid refreshToken using joi
    //access refresh token and decode token
    //check wehther the decoded username exists in the database
    //if yes then match the refresh token
    //regenerate access token and send back as response

    let username = null;
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Request body cannot be empty.'
        );
    }

    const { error } = Joi.object({
        refreshToken: Joi.string().required().messages({
            'string.empty': 'Refresh token is required',
            'any.required': 'Refresh token is required',
        }),
    })
        .options({ allowUnknown: false })
        .validate(req.body);
    if (error) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            error.details[0].message
        );
    }

    try {
        username = await verifyRefreshToken(req.body.refreshToken);
    } catch (error) {
        throw new Apierror(401, error.message);
    }

    const exists = await Student.findOne({
        username: username,
        is_deleted: false,
    })
        .lean()
        .select('refreshToken public_id username');

    if (!exists) {
        throw new Apierror(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            'Student Not Found'
        );
    }
    if (exists.refreshToken != req.body.refreshToken) {
        throw new Apierror(
            HTTP_STATUS_CODES.FORBIDDEN.code,
            'Refresh Token does not match use valid token'
        );
    }

    const accessToken = await signAccessToken({
        studentId: exists.public_id,
        role: 'student',
        username: exists.username,
    });

    res.status(200).json(
        new Apiresponse({
            message: 'New token generated successfully..',
            token: accessToken,
        })
    );
});

export {
    updateStudent,
    registerStudent,
    loginStudent,
    getCurrentstudent,
    getStudents,
    deleteStudent,
    deleteStudentAllRecord,
    regenerateAccessToken,
};
