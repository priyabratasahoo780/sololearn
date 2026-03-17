const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error.middleware');
const ApiError = require('./utils/ApiError');

// Route files
const auth = require('./routes/auth.routes');
const quizzes = require('./routes/quiz.routes');
const leaderboard = require('./routes/leaderboard.routes');
const certificates = require('./routes/certificate.routes');
const reviews = require('./routes/review.routes');
const posts = require('./routes/post.routes');
const ai = require('./routes/ai.routes');

const app = express();

// Security Header
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again in 10 minutes'
});
app.use('/api', limiter);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/quizzes', quizzes);
app.use('/api/leaderboard', leaderboard);
app.use('/api/certificates', certificates);
app.use('/api/reviews', reviews);
app.use('/api/posts', posts);
app.use('/api/ai', ai);

// 404 handler
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
