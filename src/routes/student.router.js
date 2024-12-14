import { Router } from 'express';
import {
    registerStudent,
    loginStudent,
    getCurrentstudent,
    getStudents,
    deleteStudent,
    deleteStudentAllRecord,
} from '../controllers/student.controller.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
const studentRouter = Router();

studentRouter.route('/register').post(registerStudent);
studentRouter.route('/login').post(loginStudent);
studentRouter.route('/').get(getStudents);
studentRouter.route('/me').get(authMiddleware, getCurrentstudent);
studentRouter.route("/:studentId").delete(deleteStudent);
studentRouter.route("/:studentId/clear").delete(deleteStudentAllRecord);
export { studentRouter };
