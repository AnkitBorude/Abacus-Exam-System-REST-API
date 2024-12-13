import jwt from 'jsonwebtoken';
import process from 'node:process';
const signToken = async (payload) => {
    const token = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    return token;
};
export default signToken;
