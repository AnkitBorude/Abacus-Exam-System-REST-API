import jwt from 'jsonwebtoken';
import Apierror from '../utils/apierror.util.js';
import process from 'node:process';
import { HTTP_STATUS_CODES } from '../constants.js';
const authMiddleware = (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1]; // Expect "Bearer <token>"
        if (!token) {
            //setting the header
            res.set(
                'WWW-Authenticate',
                'Bearer realm="API", error="token_required", error_description="Token is required"'
            );
             return res.status(HTTP_STATUS_CODES.UNAUTHORIZED.code).json({...new Apierror(401,"Token not found"),message:"Access token is missing"});
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
            if(error.name=="TokenExpiredError")
            {
                //if the token is expired
                return res.status(HTTP_STATUS_CODES.UNAUTHORIZED.code).json({...new Apierror(HTTP_STATUS_CODES.UNAUTHORIZED.code,"Token is Expired"),message:"Token is Expired"});

            }
            else if(error.name=="JsonWebTokenError")
            {
                //if the token is invalid
                return res.status(HTTP_STATUS_CODES.UNAUTHORIZED.code).json({...new Apierror(HTTP_STATUS_CODES.UNAUTHORIZED.code,"Token is Invalid"),message:"Token is Invalid"});

            }
            else
            {
                return res.status(500).json({message:"Internal server error while verifying token"});
            }
        }
}

export default authMiddleware;
