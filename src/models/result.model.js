import mongoose from 'mongoose';
import { generatePublicId } from '../utils/publicId/generatePublicid.util.js';
const resultSchema = new mongoose.Schema(
    {
        score: {
            type: Number,
            required: true,
        },
        time_taken: {
            type: Number,
            required: true,
        },
        total_correct: {
            type: Number,
            required: true,
        },
        date_completed: {
            type: Date,
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        public_id: {
            type: String,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true }
);

resultSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.public_id = generatePublicId('result');
        next();
    }
    return next();
});
export const Result = mongoose.model('Result', resultSchema);
