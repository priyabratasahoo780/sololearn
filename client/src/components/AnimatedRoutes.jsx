import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from './ProtectedRoute';
import PageTransition from './PageTransition';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import QuizList from '../pages/QuizList';
import CreateQuiz from '../pages/CreateQuiz';
import QuizPage from '../pages/QuizPage';
import Leaderboard from '../pages/Leaderboard';
import Rewards from '../pages/Rewards';
import Feed from '../pages/Feed';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Certificates from '../pages/Certificates';
import Profile from '../pages/Profile';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/signup" element={
          <PageTransition>
            <Signup />
          </PageTransition>
        } />
        <Route path="/forgot-password" element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        } />
        <Route path="/reset-password/:token" element={
          <PageTransition>
            <ResetPassword />
          </PageTransition>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/quizzes" element={
          <ProtectedRoute>
            <PageTransition>
              <QuizList />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/quizzes/:id" element={
          <ProtectedRoute>
            <PageTransition>
              <QuizPage />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/create-quiz" element={
          <ProtectedRoute>
            <PageTransition>
              <CreateQuiz />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <PageTransition>
              <Leaderboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/rewards" element={
          <ProtectedRoute>
            <PageTransition>
              <Rewards />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute>
            <PageTransition>
              <Feed />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/certificates" element={
          <ProtectedRoute>
            <PageTransition>
              <Certificates />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <PageTransition>
              <Profile />
            </PageTransition>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
