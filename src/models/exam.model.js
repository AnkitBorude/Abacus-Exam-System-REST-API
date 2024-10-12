import mongoose from 'mongoose';
import { questionSchema } from './question.model.js';
const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  total_questions: {
    type: Number,
    required: true
  },
  total_marks: {
    type: Number,
  },
  total_marks_per_question: {
    type: Number,
    default:1
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  questions: [questionSchema]
}, { timestamps: true });

examSchema.set('toJSON',{
  transform:(doc,rec)=>{
    rec.id=rec._id.toString();
    delete rec.__v;
    delete rec.questions;
    delete rec._id;
    delete rec.updatedAt;
    return rec;
  }
})
export const Exam = mongoose.model('Exam', examSchema);

