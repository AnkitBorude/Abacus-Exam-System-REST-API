import { Router } from 'express';
import {
    registerStudent,
    loginStudent,
    getCurrentstudent,
    getStudents,
    deleteStudent,
    deleteStudentAllRecord,
    updateStudent,
    regenerateAccessToken
} from '../controllers/student.controller.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
import { studentValidation } from '../middlewares/studentValidation.middleware.js';
const studentRouter = Router();

studentRouter.route('/register').post(studentValidation,registerStudent);
studentRouter.route('/login').post(loginStudent);
studentRouter.route('/').get(getStudents);
studentRouter.route('/me').get(authMiddleware, getCurrentstudent);
studentRouter.route('/:studentId').delete(authMiddleware, deleteStudent);
studentRouter
    .route('/:studentId/clear')
    .delete(authMiddleware, deleteStudentAllRecord);
studentRouter.route('/:studentId').patch(authMiddleware,studentValidation, updateStudent);
studentRouter.route('/token').post(regenerateAccessToken);
export { studentRouter };
