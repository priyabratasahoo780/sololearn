const express = require('express');
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/review.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
