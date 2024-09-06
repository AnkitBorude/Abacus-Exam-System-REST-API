import mongoose from mongoose;
import { testCaseSchema } from "./testcase.model";
const QuestionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    marks: {
        type: Number,
        min: [0, 'Marks cannot be negative'],
        default: 0
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    testCases: {
        type: [testCaseSchema],
        required: true,
    }
}, {
    timestamps: true
});

export const Question = mongoose.model('Question', QuestionSchema);
