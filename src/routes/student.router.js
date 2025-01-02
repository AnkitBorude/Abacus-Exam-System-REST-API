import { Router } from 'express';
import {
    registerStudent,
    loginStudent,
    getCurrentstudent,
    getStudents,
    deleteStudent,
    deleteStudentAllRecord,
    updateStudent,
    regenerateAccessToken,
    getStudentPracticeExamAnalytics,
    getStudentAssessmentExamAnalytics
} from '../controllers/student.controller.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
import { studentValidation } from '../middlewares/studentValidation.middleware.js';
const studentRouter = Router();

studentRouter.route('/register').post(studentValidation, registerStudent);
studentRouter.route('/login').post(loginStudent);
studentRouter.route('/').get(authMiddleware, getStudents);
studentRouter.route('/me').get(authMiddleware, getCurrentstudent);
studentRouter.route('/:studentId').delete(authMiddleware, deleteStudent);
studentRouter
    .route('/:studentId/clear')
    .delete(authMiddleware, deleteStudentAllRecord);
studentRouter
    .route('/:studentId')
    .patch(authMiddleware, studentValidation, updateStudent);
studentRouter.route('/token').post(regenerateAccessToken);
studentRouter.route('/exam/practice/analytics').get(authMiddleware,getStudentPracticeExamAnalytics);
studentRouter.route('/:studentId/exam/practice/analytics').get(authMiddleware,getStudentPracticeExamAnalytics);
studentRouter.route('/:studentId/exam/assessment/analytics').get(authMiddleware,getStudentAssessmentExamAnalytics);
studentRouter.route('/exam/assessment/analytics').get(authMiddleware,getStudentAssessmentExamAnalytics)
export { studentRouter };
