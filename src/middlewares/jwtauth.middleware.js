import jwt from "jsonwebtoken";
import Apierror from "../utils/apierror.util";
const authMiddleware = (req, res, next) => {
    try
    {
    const token = req.header('Authorization')?.split(' ')[1];  // Expect "Bearer <token>"
    if (!token) {
        throw new Apierror(401,"Authorization  token required");
    }
        try{
        const decoded = jwt.verify(token, JWT_SECRET);  // Verify token
        req.user = decoded;  // Attach the decoded payload to the request object
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

{

}
};