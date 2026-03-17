const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Quiz = require('../models/Quiz.model');
const User = require('../models/User.model');
const Certificate = require('../models/Certificate.model');
const Post = require('../models/Post.model');
const crypto = require('crypto');
const { checkBadges } = require('../utils/badgeEngine');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
exports.getQuizzes = asyncHandler(async (req, res, next) => {
  let query;
  
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let mongoQuery = JSON.parse(queryStr);

  // Search by title
  if (req.query.search) {
    mongoQuery.title = { $regex: req.query.search, $options: 'i' };
  }

  // Finding resource
  query = Quiz.find(mongoQuery).populate('createdBy', 'name');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Quiz.countDocuments(mongoQuery);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const quizzes = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: quizzes.length,
    pagination,
    data: quizzes
  });
});

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public (Protected if we want auth users only)
exports.getQuizById = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');

  if (!quiz) {
    return next(new ApiError(404, `Quiz not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: quiz
  });
});

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private
exports.createQuiz = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const quiz = await Quiz.create(req.body);

  res.status(201).json({
    success: true,
    data: quiz
  });
});

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ApiError(404, `Quiz not found with id of ${req.params.id}`));
  }

  // Make sure user is quiz owner or admin
  if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(401, `User ${req.user.id} is not authorized to update this quiz`));
  }

  quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: quiz
  });
});

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin Only according to specs, or Owner)
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ApiError(404, `Quiz not found with id of ${req.params.id}`));
  }

  // Admin only logic requested
  if (req.user.role !== 'admin') {
     return next(new ApiError(401, `User ${req.user.id} is not authorized to delete this quiz`));
  }

  await quiz.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Unlock premium quiz
// @route   POST /api/quizzes/:id/unlock
// @access  Private
exports.unlockQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ApiError(404, `Quiz not found with id of ${req.params.id}`));
  }

  // Check if already unlocked
  if (req.user.unlockedQuizzes.includes(quiz._id)) {
    return res.status(200).json({
      success: true,
      message: 'Quiz already unlocked'
    });
  }

  // Check coin balance
  if (req.user.coins < quiz.unlockCost) {
    return next(new ApiError(400, `Not enough coins. Need ${quiz.unlockCost} coins.`));
  }

  // Deduct coins and unlock
  req.user.coins -= quiz.unlockCost;
  req.user.unlockedQuizzes.push(quiz._id);
  
  await req.user.save();

  res.status(200).json({
    success: true,
    message: `Quiz unlocked successfully for ${quiz.unlockCost} coins`,
    coins: req.user.coins
  });
});

const QuizAttempt = require('../models/QuizAttempt.model');
const { sendStartEmail, sendScorecardEmail } = require('../utils/sendEmail');

// ... existing imports ...

// @desc    Start quiz attempt
// @route   POST /api/quizzes/:id/start
// @access  Private
exports.startQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ApiError(404, `Quiz not found with id of ${req.params.id}`));
  }

  // Check Global Lockout
  if (req.user.testLockoutUntil && req.user.testLockoutUntil > Date.now()) {
    const remainingTime = Math.ceil((req.user.testLockoutUntil - Date.now()) / (1000 * 60 * 60 * 24));
    return next(new ApiError(403, `Global Cheating detected! You are locked out from all tests for another ${remainingTime} days.`));
  }

  // Check Per-Quiz Lockout
  const quizLockout = req.user.quizLockouts?.find(l => l.quizId.toString() === quiz._id.toString());
  if (quizLockout && quizLockout.lockoutUntil > Date.now()) {
    const remainingTime = Math.ceil((quizLockout.lockoutUntil - Date.now()) / (1000 * 60 * 60 * 24));
    return next(new ApiError(403, `This specific test is locked for you. You can try again in ${remainingTime} days.`));
  }

  // Check Premium Access
  if (quiz.isPremium && quiz.unlockCost > 0) {
    const user = req.user;
    if (!user.unlockedQuizzes.includes(quiz._id)) {
       return next(new ApiError(403, `This is a premium quiz. Please unlock it for ${quiz.unlockCost} coins.`));
    }
  }

  // Create Attempt
  const attempt = await QuizAttempt.create({
    userId: req.user.id,
    quizId: quiz._id,
    status: 'started'
  });

  // Send Start Email (Async)
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  sendStartEmail(req.user, quiz, clientUrl).catch(err => console.error(err));

  res.status(200).json({
    success: true,
    data: {
      attemptId: attempt._id,
      message: 'Quiz started successfully'
    }
  });
});

// @desc    Report cheating violation
// @route   POST /api/quizzes/attempts/:attemptId/violation
// @access  Private
exports.reportViolation = asyncHandler(async (req, res, next) => {
  const { type } = req.body;
  const attempt = await QuizAttempt.findById(req.params.attemptId);

  if (!attempt) {
    return next(new ApiError(404, 'Attempt not found'));
  }

  // Record violation
  attempt.violations.push({ type, timestamp: new Date() });
  
  // Check if 3 violations reached
  if (attempt.violations.length >= 3) {
    attempt.status = 'failed';
    attempt.isTerminated = true;
    
    // Apply 3-day lockout to THIS SPECIFIC QUIZ
    const user = await User.findById(req.user.id);
    const lockoutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    
    // Check if a lockout already exists for this quiz
    const existingLockoutIndex = user.quizLockouts.findIndex(l => l.quizId.toString() === attempt.quizId.toString());
    
    if (existingLockoutIndex !== -1) {
      user.quizLockouts[existingLockoutIndex].lockoutUntil = lockoutDate;
    } else {
      user.quizLockouts.push({
        quizId: attempt.quizId,
        lockoutUntil: lockoutDate
      });
    }
    await user.save();
  }

  await attempt.save();

  res.status(200).json({
    success: true,
    violationCount: attempt.violations.length,
    isTerminated: attempt.isTerminated
  });
});

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const quizId = req.params.id;
  const { answers } = req.body; 

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return next(new ApiError(404, 'Quiz not found'));
  }

  if (!answers || !Array.isArray(answers)) {
    return next(new ApiError(400, 'Invalid answers format'));
  }

  let correctCount = 0;
  
  quiz.questions.forEach((q, index) => {
    if (answers[index] === q.answerIndex) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Rewards Calculation
  const basePoints = correctCount * 10;
  let bonusPoints = 0;
  if (scorePercent >= 80) bonusPoints += 50;
  if (scorePercent === 100) bonusPoints += 100;
  const pointsEarned = basePoints + bonusPoints;

  // Update User History
  const user = await User.findById(req.user.id);

  const coinsEarned = Math.floor(pointsEarned / 10);
  
  // Update coins
  user.coins = (user.coins || 0) + coinsEarned;

  // Check for Badges
  const badgesUnlocked = checkBadges(user, {
    scorePercent,
    category: quiz.category
  });
  
  // Add points to user's total
  user.totalPoints = (user.totalPoints || 0) + pointsEarned;

  user.quizzesAttempted.push({
    quizId: quiz._id,
    score: scorePercent,
    totalQuestions,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    pointsEarned, 
    coinsEarned,
    date: Date.now()
  });

  // Auto-Generate Certificate if >= 80%
  if (scorePercent >= 80) {
    const existingCert = await Certificate.findOne({
      user: user._id,
      title: quiz.title,
      category: quiz.category
    });

    if (!existingCert) {
      const certificateCode = crypto.randomBytes(8).toString('hex').toUpperCase();
      await Certificate.create({
        user: user._id,
        title: quiz.title,
        category: quiz.category,
        scorePercent,
        certificateCode
      });
      // Optional: Add notification or include in response
    }

    // Auto-Post to Social Feed
    try {
      await Post.create({
        user: user._id,
        content: `I just completed the ${quiz.title} quiz with a score of ${scorePercent}%! 🏆`,
        type: 'achievement',
        metadata: {
          quizTitle: quiz.title,
          score: scorePercent,
          category: quiz.category
        }
      });
    } catch (err) {
      console.error('Failed to create achievement post:', err);
    }
  }

  await user.save();

  // Send Scorecard Email (With Points)
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  sendScorecardEmail(user, {
    quizTitle: quiz.title,
    category: quiz.category,
    scorePercent,
    pointsEarned,
    coinsEarned,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    totalQuestions,
    badgesUnlocked: badgesUnlocked || [] // Assuming badges are calculated somewhere, pass as needed
  }, clientUrl).catch(err => console.error('Email send failed:', err));

  res.status(200).json({
    message: "Quiz submitted successfully. Scorecard emailed ✅",
    result: { 
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      scorePercent,
      pointsEarned,
      coinsEarned,
      badgesUnlocked
    }
  });
});
