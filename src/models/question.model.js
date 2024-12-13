import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: Number,
        required: true,
    },
    marks: {
        type: Number,
        required: true,
    },
    option_a: {
        type: Number,
        required: true,
    },
    option_b: {
        type: Number,
        required: true,
    },
    option_c: {
        type: Number,
        required: true,
    },
    option_d: {
        type: Number,
        required: true,
    },
});

questionSchema.set('toJSON', {
    transform: (doc, rec) => {
        delete rec._id;

        return rec;
    },
});
const Question = new mongoose.model('Question', questionSchema);
export { Question, questionSchema };
