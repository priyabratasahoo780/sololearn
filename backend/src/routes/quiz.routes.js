const express = require('express');
const {
  deleteQuiz,
  submitQuiz,
  startQuiz,
  unlockQuiz,
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  reportViolation
} = require('../controllers/quiz.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Basic CRUD
router.route('/')
  .get(getQuizzes)
  .post(protect, authorize('admin'), createQuiz);

router.route('/:id')
  .get(getQuizById)
  .put(protect, authorize('admin'), updateQuiz)
  .delete(protect, authorize('admin'), deleteQuiz);

// Actions
router.route('/:id/unlock')
  .post(protect, unlockQuiz);

router.route('/:id/start')
  .post(protect, startQuiz);

router.route('/:id/submit')
  .post(protect, submitQuiz);

router.route('/attempts/:attemptId/violation')
  .post(protect, reportViolation);

module.exports = router;
