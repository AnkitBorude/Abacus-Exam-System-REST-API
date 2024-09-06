import {Router} from "express";
import { registerStudent,loginStudent } from "../controllers/student.controller.js";
const studentRouter=Router();

studentRouter.route("/register").post(registerStudent);
studentRouter.route("/login").post(loginStudent);
export {studentRouter};