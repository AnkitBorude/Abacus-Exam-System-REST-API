//controller for student registration
import asyncHandler from '../utils/asynchandler.util.js';
import Apierror from '../utils/apierror.util.js';
import Apiresponse from '../utils/apiresponse.util.js';
import { Student } from '../models/student.model.js';
import { validatefields } from '../utils/validatereqfields.util.js';
import signToken from '../utils/jwttoken.util.js';
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
            401,
            validParams.parameterName + ' is / are null or undefined'
        );
    }
    let student; //extracting the admin from the db
    try {
        student = await Student.findOne({ username });
    } catch (error) {
        throw new Apierror(402, error.message);
    }
    if (!student) {
        throw new Apierror(403, 'Student username does not exists');
    }

    if (!(await student.comparePassword(password))) {
        if (student.password != password) {
            //implemented temporary for old legacy passwords until all passwords are not reseted and rehashed
            throw new Apierror(405, 'Wrong Password');
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
//performing soft delete and hard delete as required

});

const deleteStudentAllRecord=asyncHandler(async(req,res)=>{

});

export { registerStudent, loginStudent, getCurrentstudent, getStudents,deleteStudent,deleteStudentAllRecord };