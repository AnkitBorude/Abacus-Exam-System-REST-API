import { Router } from "express";
import { createExam,getAdminExams,getStudentExams } from "../controllers/exam.controller.js";
import authMiddleware from "../middlewares/jwtauth.middleware.js";
const examRouter=Router();

examRouter.route("/").post(authMiddleware,createExam);
examRouter.route("/admin").get(authMiddleware,getAdminExams);
examRouter.route("/student").get(authMiddleware,getStudentExams);
export {examRouter};