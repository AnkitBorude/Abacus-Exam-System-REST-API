import mongoose from 'mongoose';
import { questionSchema } from './question.model.js';
import { Result } from './result.model.js';
const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        level: {
            type: String,
            required: true,
        },
        total_questions: {
            type: Number,
            required: true,
        },
        total_marks: {
            type: Number,
        },
        total_marks_per_question: {
            type: Number,
            default: 1,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        isSingleAttempt: {
            type: Boolean,
            default: false,
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        questions: [questionSchema],
    },
    { timestamps: true }
);

examSchema.set('toJSON', {
    transform: (doc, rec) => {
        rec.exam_id = rec._id.toString();
        delete rec.__v;
        delete rec.questions;
        delete rec._id;
        delete rec.updatedAt;
        return rec;
    },
});

examSchema.methods.isExamAttempted = async function (studentId) {
    const examId = new mongoose.Types.ObjectId(this._id);
    studentId = new mongoose.Types.ObjectId(studentId);
    const result = await Result.findOne({ exam: examId, student: studentId });
    if (result == null) {
        return { attempted: false, attempt_date: null };
    }
    //returning the date of the attempt if the exam is attempted
    return { attempted: true, attempt_date: result.date_completed };
};

examSchema.methods.countAttempts = async function (studentId) {
    let count = 0;
    const examId = new mongoose.Types.ObjectId(this._id);
    studentId = new mongoose.Types.ObjectId(studentId);
    count = await Result.countDocuments({ exam: examId, student: studentId });
    return count;
};
export const Exam = mongoose.model('Exam', examSchema);
