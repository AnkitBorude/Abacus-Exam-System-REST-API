import { Router } from "express";
import { createExam } from "../controllers/exam.controller.js";
import authMiddleware from "../middlewares/jwtauth.middleware.js";
const examRouter=Router();

examRouter.route("/create").post(authMiddleware,createExam);
export {examRouter};