import { Router } from "express";
import authMiddleware from "../middlewares/jwtauth.middleware.js";
import { createResult } from "../controllers/result.controller.js";
const resultRouter=Router();

resultRouter.route("/").post(authMiddleware,createResult);
export {resultRouter};