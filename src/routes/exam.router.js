import { Router } from "express";
import { createExam,getExams,getQuestions,activateExam} from "../controllers/exam.controller.js";
import authMiddleware from "../middlewares/jwtauth.middleware.js";
const examRouter=Router();

examRouter.route("/").post(authMiddleware,createExam);
examRouter.route("/").get(authMiddleware,getExams);
examRouter.route("/:examId/questions").get(authMiddleware,getQuestions);
examRouter.route("/:examId/activate").post(authMiddleware,activateExam)
export {examRouter};