const Post = require('../models/Post.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all feed posts
// @route   GET /api/posts
// @access  Private
exports.getFeed = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('user', 'name profileImage')
    .populate('comments.user', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  const { content, type, metadata } = req.body;

  if (!content) {
    return next(new ApiError(400, 'Please provide content for the post'));
  }

  const post = await Post.create({
    user: req.user.id,
    content,
    type: type || 'status',
    metadata: metadata || {}
  });

  const populatedPost = await Post.findById(post._id).populate('user', 'name profileImage');

  res.status(201).json({
    success: true,
    data: populatedPost
  });
});

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ApiError(404, 'Post not found'));
  }

  const isLiked = post.likes.some(id => id.toString() === req.user.id.toString());

  if (isLiked) {
    post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
  } else {
    post.likes.push(req.user.id);
  }

  await post.save();

  res.status(200).json({
    success: true,
    likes: post.likes.length,
    isLiked: !isLiked
  });
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    return next(new ApiError(400, 'Comment text is required'));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ApiError(404, 'Post not found'));
  }

  const comment = {
    user: req.user.id,
    text
  };

  post.comments.unshift(comment);
  await post.save();

  const freshPost = await Post.findById(post._id).populate('comments.user', 'name profileImage');

  res.status(201).json({
    success: true,
    data: freshPost.comments[0]
  });
});
