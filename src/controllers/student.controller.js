//controller for student registration
import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Student } from '../models/student.model.js';
import { validatefields } from '../utils/validatereqfields.util.js';
import signToken from '../utils/jwttoken.util.js';
import { HTTP_STATUS_CODES } from '../constants.js';
import mongoose from 'mongoose';
import { Result } from '../models/result.model.js';
const registerStudent = asyncHandler(async (req, res) => {
    const { fullname, email, username, level, sclass, phone_no, password } =
        req.body;
    let validParams = validatefields({
        fullname,
        email,
        username,
        level,
        sclass,
        phone_no,
        password,
    });
    if (validParams.parameterisNull) {
        throw new Apierror(
            401,
            validParams.parameterName + ' is are null or undefined'
        );
    }

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
        res.json(new Apiresponse('Student Registration Successfull', 200));
    } catch (error) {
        if (
            error.code === 11000 &&
            error.keyPattern &&
            error.keyPattern.username
        ) {
            throw new Apierror(402, 'Username already Exists');
        } else {
            throw new Apierror(402, error.message);
        }
    }
});

const loginStudent = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    let validParams = validatefields({ username, password });
    if (validParams.parameterisNull) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            validParams.parameterName + ' is / are null or undefined'
        );
    }
    //extracting the student from the db
  
        let student = await Student.findOne({ username });
    if (!student || student.is_deleted) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Student does not exists');
    }
    if (!(await student.comparePassword(password))) {
        if (student.password != password) {
            //implemented temporary for old legacy passwords until all passwords are not reseted and rehashed
            throw new Apierror(HTTP_STATUS_CODES.BAD_REQUEST.code, 'Wrong Password');
        }
    }
    //adding jwt token
    const token = await signToken({
        studentId: student._id.toString(),
        role: 'student',
        username: student.username,
    });
    return res
        .status(200)
        .json(
            new Apiresponse({ message: 'Login Successfull', token: token }, 200)
        );
});

const getCurrentstudent = asyncHandler(async (req, res) => {
    try {
        let student = await Student.findById(req.user);
        student = student.toJSON();
        return res.status(200).json(new Apiresponse(student, 200));
    } catch (error) {
        throw new Apierror(441, error.message);
    }
});

/**
 * Returns the student by the query parameter by the level and class
 * and returns by the name query parameter passed by name starts with the
 * given query string name
 */
const getStudents = asyncHandler(async (req, res) => {
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
            '-_id -password -refreshToken -__v'
        );
    } catch (error) {
        throw new Apierror(489, error.message);
    }
    if (students.length == 0) {
        throw new Apierror(490, 'No students found');
    }

    return res
        .status(200)
        .json(new Apiresponse(students.map((s) => s.toJSON())));
});

const deleteStudent=asyncHandler(async(req,res)=>{
//performing soft delete and hard delete of the student
    let studentId = req.params.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Student Id'
        );
    }
    studentId = new mongoose.Types.ObjectId(studentId);
    let student = await Student.findById(studentId);
    if (!student || student.is_deleted) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Student Not found');
    }
    const exists = await Result.findOne({ student: studentId }).lean().select('_id');
    if (exists) {
        //soft delete
        student.is_deleted = true;
        student.deletedAt = new Date();
        //making the soft deleted students username reusable
        student.username=student.username+"deletedAt"+Date.now();
        await student.save();
    } else {
        //hard delete
        await Student.deleteOne({ _id: student._id });
    }
    res.status(200).json(new Apiresponse(`Student deleted Successfully`, 200));

});

const deleteStudentAllRecord=asyncHandler(async(req,res)=>{

    //remove all the results;
    //remove the whole student
    let studentId = req.params.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Apierror(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            'Invalid Student Id'
        );
    }
    studentId = new mongoose.Types.ObjectId(studentId);
    let student = await Student.findById(studentId);
    if (!student) {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code, 'Student Not found');
    }

    //delete all associated results
   let deletedObj= await Result.deleteMany({ student: studentId });
    //delete the student
    await Student.deleteOne({ _id: student._id });

    res.status(200).json(new Apiresponse(`Student and associated ${deletedObj.deletedCount} records deleted Successfully`, 200));
});

export { registerStudent, loginStudent, getCurrentstudent, getStudents,deleteStudent,deleteStudentAllRecord };