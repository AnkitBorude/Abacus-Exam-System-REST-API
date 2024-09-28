import {Router} from "express";
import { registerAdmin,loginAdmin,getCurrentAdmin } from "../controllers/admin.controller.js";
const adminRouter=Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);

studentRouter.route("/me").get(authMiddleware,getCurrentAdmin);
export {adminRouter};