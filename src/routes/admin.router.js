import {Router} from "express";
import { registerAdmin,loginAdmin } from "../controllers/admin.controller.js";
const adminRouter=Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);

export {adminRouter};