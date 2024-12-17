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
    deleteResults,
    updateExam,
    generateQuestions,
} from '../controllers/exam.controller.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
import { questionValidation } from '../middlewares/questionValidation.middleware.js';
import { examValidation } from '../middlewares/examValidation.middleware.js';
const examRouter = Router();

examRouter.route('/').post(authMiddleware,examValidation,createExam);
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
examRouter.route('/:examId/results').delete(authMiddleware, deleteResults);
examRouter.route('/:examId').patch(authMiddleware, updateExam);
examRouter.route('/:examId/questions').patch(authMiddleware,questionValidation,generateQuestions);
export { examRouter };
