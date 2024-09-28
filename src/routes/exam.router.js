import { Router } from "express";
import { createExam } from "../controllers/exam.controller.js";
const examRouter=Router();

examRouter.route("/create").post(createExam);
export {examRouter};