import { Router } from "express";
import authMiddleware from "../middlewares/jwtauth.middleware.js";
import { createResult, getResultpdf} from "../controllers/result.controller.js";
const resultRouter=Router();

resultRouter.route("/").post(authMiddleware,createResult);
resultRouter.route("/:resultId/pdf").get(getResultpdf);
export {resultRouter};