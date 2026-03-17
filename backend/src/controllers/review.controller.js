const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review.model');
const Post = require('../models/Post.model');

// @desc    Get all reviews (Public)
// @route   GET /api/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('user', 'name')
    .sort('-createdAt')
    .limit(20); // Limit to recent 20 for now

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const existingReview = await Review.findOne({ user: req.user.id });

  if (existingReview) {
    return next(new ApiError(400, 'You have already submitted a review'));
  }

  const review = await Review.create(req.body);

  // Auto-Post to Social Feed
  try {
    await Post.create({
      user: req.user.id,
      content: `I just shared a review: "${review.comment}" ⭐ ${review.rating}/5`,
      type: 'review',
      metadata: {
        reviewId: review._id,
        rating: review.rating
      }
    });
  } catch (err) {
    console.error('Failed to create post for review:', err);
  }

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Owner only)
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(404, 'Review not found'));
  }

  // Make sure user is review owner
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(401, 'Not authorized to update this review'));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(404, 'Review not found'));
  }

  // Make sure user is review owner or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(401, 'Not authorized to delete this review'));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
