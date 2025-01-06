import { Router } from 'express';
import {
    registerAdmin,
    loginAdmin,
    getCurrentAdmin,
    regenerateAccessToken,
    deleteAdmin,
    updateAdmin,
} from '../controllers/admin.controller.js';
import { adminValidation } from '../middlewares/adminValidation.middleware.js';
import authMiddleware from '../middlewares/jwtauth.middleware.js';
const adminRouter = Router();

adminRouter.route('/register').post(adminValidation, registerAdmin);
adminRouter.route('/login').post(loginAdmin);
adminRouter.route('/').delete(authMiddleware, deleteAdmin);
adminRouter.route('/').patch(authMiddleware, adminValidation, updateAdmin);
adminRouter.route('/me').get(authMiddleware, getCurrentAdmin);
adminRouter.route('/token').post(regenerateAccessToken);
export { adminRouter };
