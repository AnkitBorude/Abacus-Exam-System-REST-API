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
export {signAccessToken,signRefreshToken};
