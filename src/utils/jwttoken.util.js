import jwt from 'jsonwebtoken';
import process from 'node:process';
const signAccessToken = async (payload) => {
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    return token;
};
const signRefreshToken = async (payload) => {
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
    return token;
};

const verifyRefreshToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded.username;
    } catch (error) {
        if (error.name == 'TokenExpiredError') {
            //if the token is expired
            throw new Error('Refresh Token is Expired Log in again');
        } else if (error.name == 'JsonWebTokenError') {
            //if the token is invalid
            throw new Error('Refresh Token is Invalid');
        } else {
            throw new Error('Internal server error while verifying token');
        }
    }
};
export { signAccessToken, signRefreshToken, verifyRefreshToken };
