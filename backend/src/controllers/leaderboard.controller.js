const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User.model');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  // Sort rules: 1) totalPoints desc, 2) coins desc
  // Getting top 10
  const users = await User.find({})
    .select('name totalPoints coins quizzesAttempted badges')
    .sort({ totalPoints: -1, coins: -1 })
    .limit(10);

  // Add rank to response
  const rankedUsers = users.map((user, index) => ({
    rank: index + 1,
    id: user._id,
    name: user.name,
    totalPoints: user.totalPoints,
    coins: user.coins,
    badges: user.badges,
    quizzesCompleted: user.quizzesAttempted.length
  }));

  res.status(200).json({
    success: true,
    count: rankedUsers.length,
    data: rankedUsers
  });
});
