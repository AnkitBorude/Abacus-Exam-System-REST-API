import { HTTP_STATUS_CODES } from "../../constants.js";
import Apierror from "../apierror.util.js";

export const isValidpublicId=(id)=>{
    const publicIdRegex = /^[A-Za-z0-9_-]{8}$/; // Matches exactly 8 alphanumeric characters
    return publicIdRegex.test(id);
}

export const getDocumentIdfromPublicid=async (id,model,resource)=>{
    const document= await model.findOne({ public_id:id }).lean().select('_id');
    if(!document)
    {
        throw new Apierror(HTTP_STATUS_CODES.NOT_FOUND.code,resource+"not found");
    }

    return document._id;
}