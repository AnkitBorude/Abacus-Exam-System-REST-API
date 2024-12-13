import { Router } from 'express';
import {
    createExam,
    getExams,
    getQuestions,
    activateExam,
    deactivateExam,
    getResults,
    getStudents,
    deleteExam,
} from '../controllers/exam.controller.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
const examRouter = Router();

examRouter.route('/').post(authMiddleware, createExam);
examRouter.route('/').get(authMiddleware, getExams);
examRouter.route('/:examId/questions').get(authMiddleware, getQuestions);
examRouter.route('/:examId/activate').post(authMiddleware, activateExam);
examRouter.route('/:examId/deactivate').post(authMiddleware, deactivateExam);
examRouter.route('/:examId/results').get(authMiddleware, getResults);
examRouter.route('/:examId/students').get(authMiddleware, getStudents);
examRouter
    .route('/:examId/students/:studentId/results')
    .get(authMiddleware, getResults);
examRouter.route('/:examId').delete(deleteExam);
export { examRouter };
