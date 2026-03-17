import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const useGameLogic = (quiz) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [answers, setAnswers] = useState([]); // Track all selected answers

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const pointsPerQuestion = quiz?.pointsPerQuestion || 10;
  const totalQuestions = questions.length;

  // Reset state when quiz changes
  useEffect(() => {
    if (quiz) {
      setLives(3);
      setScore(0);
      setCurrentQuestionIndex(0);
      setAnswers(new Array(quiz.questions.length).fill(null)); // Initialize empty
      setIsGameOver(false);
      setIsCompleted(false);
    }
  }, [quiz?._id]);

  const handleAnswer = useCallback((optionIndex) => {
    if (feedback || isGameOver || isCompleted) return;

    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion.answerIndex;

    // Track answer safely
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + pointsPerQuestion);
      // toast.success(`Correct! +${pointsPerQuestion} pts`, { icon: '🎉', duration: 1000 });
    } else {
      setFeedback('wrong');
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          // Game Over logic triggers after delay
          return 0;
        }
        return newLives;
      });
      // toast.error('Wrong! -1 Life', { icon: '💔', duration: 1000 });
    }
  }, [currentQuestion, feedback, isGameOver, isCompleted, pointsPerQuestion, currentQuestionIndex, answers]);

  const finishGame = useCallback(async (finalAnswers, status = 'completed') => {
    if (isCompleted) return; // Prevent double submit
    setIsCompleted(true);
    
    // If game over, we still want to show the modal (Defeated)
    // We only submit to backend if it's a "complete" valid attempt or if we want to track failures too.
    // For now, let's submit everything to track history.
    
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, {
        answers: finalAnswers
      });

      // Show enhanced reward modal via local state? 
      // The component will handle the UI based on isCompleted/isGameOver
      if (status === 'completed') {
        toast.success(`You earned ${data.result.pointsEarned} points!`, { icon: '🏆' });
      }
    } catch (err) {
      console.error('Failed to submit quiz', err);
      // toast.error('Check console for details');
    }

  }, [quiz, isCompleted]);

  // Handle progression (Next Question or End)
  const nextQuestion = useCallback(() => {
    if (lives === 0) {
       setIsGameOver(true);
       finishGame(answers, 'gameover');
       return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      // Completed successfully
      finishGame(answers, 'completed');
    }
  }, [currentQuestionIndex, totalQuestions, lives, answers, finishGame]);

  // Auto-advance/Check Game Over on wrong answer after delay ?
  // Usually we wait for user to click "Next". 
  // BUT if lives == 0, we can force game over state immediately visually, but wait for user to click "See Results"
  
  useEffect(() => {
    if (lives === 0 && !isGameOver && feedback === 'wrong') {
       // Wait for user to review the wrong answer, then click next to see Game Over?
       // OR trigger it immediately? Let's check "feedback" state.
       // User sees red screen. User clicks "Next" -> nextQuestion checks lives -> sets isGameOver.
    }
  }, [lives, isGameOver, feedback]);

  return {
    currentQuestionIndex,
    currentQuestion,
    selectedOption,
    lives,
    score,
    isGameOver,
    isCompleted,
    feedback,
    handleAnswer,
    nextQuestion,
    totalQuestions
  };
};
