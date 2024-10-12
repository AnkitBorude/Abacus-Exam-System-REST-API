import jwt from "jsonwebtoken";
import Apierror from "../utils/apierror.util.js";
const authMiddleware = (req, res, next) => {
    try
    {
    const token = req.header('Authorization')?.split(' ')[1];  // Expect "Bearer <token>"
    if (!token) {
        throw new Apierror(401,"Authorization token required");
    }
        try{
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);  // Verify token

        //Adding retracted key as request attribute
        req.user=decoded.studentId || decoded.adminId;
        req.role=decoded.role;  // Attach the decoded payload to the request object
        next();
        }catch(error)
        {
            throw new Apierror(401,"Invalid Token")
        }
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            {
                error:error.message,
                statusCode:error.statusCode,
                timestamp:error.time,
                success:false
            }
        )
    }
};

export default authMiddleware;