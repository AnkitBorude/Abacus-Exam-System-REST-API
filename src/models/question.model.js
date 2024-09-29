const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: Number,
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  option_a: {
    type: Number,
    required: true
  },
  option_b: {
    type: Number,
    required: true
  },
  option_c: {
    type: Number,
    required: true
  },
  option_d: {
    type: Number,
    required: true
  }
});

export const Question = new mongoose.model('Question',questionSchema);