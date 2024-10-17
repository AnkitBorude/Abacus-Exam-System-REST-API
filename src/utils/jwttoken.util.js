import jwt from "jsonwebtoken";
import config from "config";
const signToken=async (payload)=>{

const token=await jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:ACCESS_TOKEN_EXPIRY});
return token;
}
export default signToken;