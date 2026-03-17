const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question text']
  },
  options: {
    type: [String],
    required: [true, 'Please add options'],
    validate: [arrayLimit, '{PATH} must be between 2 and 6 options']
  },
  answerIndex: {
    type: Number,
    required: [true, 'Please add the correct answer index']
  },
  explanation: {
    type: String,
    default: ''
  }
});

function arrayLimit(val) {
  return val.length >= 2 && val.length <= 6;
}

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'HTML', 'CSS', 'JavaScript', 'ReactJS', 
      'SQL', 'NoSQL', 'Java', 'NextJs', 'AngularJS', 'General',
      'Python', 'Git'
    ]
  },
  difficulty: {
    type: String,
    required: [true, 'Please select difficulty'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  pointsPerQuestion: {
    type: Number,
    default: 10
  },
  unlockCost: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [questionSchema],
    validate: [questionsLimit, 'Quiz must have at least 1 question']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function questionsLimit(val) {
  return val.length > 0;
}

module.exports = mongoose.model('Quiz', quizSchema);
