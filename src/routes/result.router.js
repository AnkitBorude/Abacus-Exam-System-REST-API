import { Router } from 'express';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
import { createResult, deleteResult, getResult } from '../controllers/result.controller.js';
const resultRouter = Router();

resultRouter.route('/').post(authMiddleware, createResult);
resultRouter.route('/:resultId').get(authMiddleware,getResult);
resultRouter.route('/:resultId').delete(authMiddleware,deleteResult);
export { resultRouter };
