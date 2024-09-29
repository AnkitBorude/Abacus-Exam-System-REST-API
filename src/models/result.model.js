import mongoose from "mongoose";
const resultSchema = new mongoose.Schema({
    score: 
    {
         type: Number, 
         required: true
    },
    time_taken: 
    { 
        type: Number, 
        required: true 
    },
    total_correct: 
    { 
        type: Number,
        required: true 
    },
    date_completed: 
    { 
        type: Date, 
        required: true 
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }
  });

export const Result = mongoose.model('Result', resultSchema);