import jwt from 'jsonwebtoken';
import Apierror from '../utils/apierror.util.js';
import process from 'node:process';
import { HTTP_STATUS_CODES } from '../constants.js';
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]; // Expect "Bearer <token>"
        if (!token) {
            res.set(
                'WWW-Authenticate',
                'Bearer realm="API", error="token_required", error_description="Token is required"'
            );
            throw new Apierror(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                'Authorization token required'
            );
        }
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify token

            //Adding retracted key as request attribute
            req.user = decoded.studentId || decoded.adminId;
            req.role = decoded.role;
            req.username = decoded.username;
            // Attach the decoded payload to the request object
            next();
        } catch (error) {
            res.set(
                'WWW-Authenticate',
                'Bearer realm="API", error="invalid_token", error_description="Token is expired or invalid"'
            );
            throw new Apierror(
                HTTP_STATUS_CODES.UNAUTHORIZED.code,
                'Invalid Token' + error.message
            );
        }
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.message,
            statusCode: error.statusCode,
            timestamp: error.time,
            success: false,
        });
    }
};

export default authMiddleware;
