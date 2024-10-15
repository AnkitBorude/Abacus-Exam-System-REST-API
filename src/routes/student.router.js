import {Router} from "express";
import { registerStudent,loginStudent,getCurrentstudent} from "../controllers/student.controller.js";
import authMiddleware from "../middlewares/jwtauth.middleware.js";
const studentRouter=Router();

studentRouter.route("/register").post(registerStudent);
studentRouter.route("/login").post(loginStudent);

studentRouter.route("/me").get(authMiddleware,getCurrentstudent);
export {studentRouter};