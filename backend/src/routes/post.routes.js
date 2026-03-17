const express = require('express');
const { getFeed, createPost, toggleLike, addComment } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All feed routes are protected

router.route('/')
  .get(getFeed)
  .post(createPost);

router.put('/:id/like', toggleLike);
router.post('/:id/comment', addComment);

module.exports = router;
