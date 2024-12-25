import { Router } from 'express';
import {
    registerAdmin,
    loginAdmin,
    getCurrentAdmin,
    regenerateAccessToken
} from '../controllers/admin.controller.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
const adminRouter = Router();

adminRouter.route('/register').post(registerAdmin);
adminRouter.route('/login').post(loginAdmin);

adminRouter.route('/me').get(authMiddleware, getCurrentAdmin);
adminRouter.route('/token').post(regenerateAccessToken);
export { adminRouter };
