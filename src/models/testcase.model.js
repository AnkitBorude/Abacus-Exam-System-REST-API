import mongoose from "mongoose";
const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    isHidden:{
        type:Boolean,
        default:false,
        required:true
    }
});
export {testCaseSchema};