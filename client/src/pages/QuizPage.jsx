import { useParams, useNavigate } from 'react-router-dom';

import { useGameLogic } from '../hooks/useGameLogic';
import { Card3D } from '../components/Card3D';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, RefreshCw, Trophy, Home } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data.data);
      } catch (err) {
        console.error('Failed to fetch quiz', err);
        navigate('/quizzes');
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  if (!quiz) return <LoadingSpinner fullScreen />;

  return <GameInterface quiz={quiz} navigate={navigate} />;
};

const GameInterface = ({ quiz, navigate }) => {
  const [attemptId, setAttemptId] = useState(null);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const {
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
  } = useGameLogic(quiz);

  // Stage 1: Enable Camera
  const handleEnableCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera permission denied:', err);
      alert('Camera access is REQUIRED for this test. Please enable it in your browser.');
    }
  };

  // Stage 2: Start Proctored Test
  const handleStartTest = async () => {
    try {
      // 1. Request Fullscreen (Best effort, but required for proctoring)
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsErr) {
        console.warn('Fullscreen request failed or denied:', fsErr);
        // We continue anyway but warn the user if we can't proctor properly
      }

      // 2. Start Attempt in backend
      const { data } = await api.post(`/quizzes/${quiz._id}/start`);
      
      if (data.success) {
        setAttemptId(data.data.attemptId);
        setHasStarted(true);
      } else {
        throw new Error('Failed to start quiz attempt on server');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsLocked(true);
      } else {
        console.error('Test Initialization Error:', err);
        alert(`Failed to start test: ${err.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  // Attach stream to video element whenever it's available and component is rendered
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error('Play error:', e));
    }
  }, [stream, hasStarted, isCameraActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // Fullscreen Enforcement (Only after test starts)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (hasStarted && !document.fullscreenElement && !isGameOver && !isCompleted) {
        reportViolation('fullscreen-exit');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [hasStarted, isGameOver, isCompleted]);

  // Violation Reporting
  const reportViolation = async (type) => {
    if (!attemptId || isGameOver || isCompleted) return;
    
    try {
      const { data } = await api.post(`/quizzes/attempts/${attemptId}/violation`, { type });
      setViolations(data.violationCount);
      
      if (data.isTerminated) {
        // Instant Lockout
        setIsLocked(true);
        setHasStarted(false);
      } else {
        setWarningType(type);
        setShowWarning(true);
      }
    } catch (err) {
      console.error('Failed to report violation', err);
    }
  };

  // Visibility & Blur Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && !isGameOver && !isCompleted) {
        reportViolation('tab-switch');
      }
    };
    const handleBlur = () => {
      if (hasStarted && !isGameOver && !isCompleted) {
        reportViolation('focus-loss');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasStarted, isGameOver, isCompleted]);

  // Anti-Inspect & DevTools Detection
  useEffect(() => {
    if (!hasStarted || isGameOver || isCompleted) return;

    // 1. Detect DevTools via Window Resize
    const checkDevToolsResize = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools likely opened as a side/bottom panel
        window.location.href = '/'; // Nuclear option: Force redirect to home
      }
    };

    // 2. Detect via Debugger Loop
    const debuggerProtection = () => {
      const startTime = performance.now();
      // eslint-disable-next-line no-debugger
      debugger; 
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        // Debugger paused execution, DevTools is active
        window.location.href = '/';
      }
    };

    const resizeInterval = setInterval(checkDevToolsResize, 1000);
    const debugInterval = setInterval(debuggerProtection, 2000);

    // 3. Prevent keyboard shortcuts (Aggressive)
    const handleKeyDown = (e) => {
      const forbiddenKeys = ['F12', 'u', 'i', 'j', 'c'];
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        window.location.href = '/';
        return;
      }

      // Block Ctrl+U (View Source)
      if (cmdOrCtrl && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        window.location.href = '/';
        return;
      }

      // Block Ctrl+Shift+I/J/C
      if (cmdOrCtrl && shift && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        window.location.href = '/';
        return;
      }

      // Block Alt+Cmd+I (Mac)
      if (isMac && cmdOrCtrl && alt && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        window.location.href = '/';
        return;
      }
    };

    // 4. Prevent Right Click & Copy/Paste
    const preventDefaults = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', preventDefaults);
    window.addEventListener('copy', preventDefaults);
    window.addEventListener('cut', preventDefaults);
    window.addEventListener('paste', preventDefaults);

    return () => {
      clearInterval(resizeInterval);
      clearInterval(debugInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', preventDefaults);
      window.removeEventListener('copy', preventDefaults);
      window.removeEventListener('cut', preventDefaults);
      window.removeEventListener('paste', preventDefaults);
    };
  }, [hasStarted, isGameOver, isCompleted]);

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0a0f1a] flex items-center justify-center p-4">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <Card3D className="relative w-full max-w-md bg-[#131b2b] border-2 border-red-500/30 p-10 text-center space-y-8 shadow-2xl shadow-red-900/20">
          <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Trophy className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white tracking-tight">Access Denied</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your account is locked out for <span className="text-red-400 font-bold">3 days</span> due to multiple cheating violations.
            </p>
          </div>

          <button 
            onClick={() => navigate('/quizzes')} 
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all shadow-lg shadow-red-600/25 uppercase tracking-widest active:scale-[0.98]"
          >
            Back to Quizzes
          </button>
        </Card3D>
      </div>
    );
  }

  // Entrance Screen (Two-Stage Start)
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
        <div className="text-center space-y-4">
           <h1 className="text-4xl font-black text-white tracking-tight">Secure Exam Gateway</h1>
           <p className="text-gray-400 max-w-lg mx-auto">This test uses advanced proctoring. Please confirm your identity and environment before starting.</p>
        </div>

        {/* Live Preview / Placeholder */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
           <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center shadow-2xl">
              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                  {/* Scanning Animation */}
                  <motion.div 
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.8)] z-10"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">System Ready</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 p-8">
                   <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <RefreshCw className="w-10 h-10 text-gray-500" />
                   </div>
                   <p className="text-gray-500 font-medium">Camera preview will appear here</p>
                </div>
              )}
           </div>
        </div>

        <Card3D className="glass-card flex flex-col">
           <div className="p-5 sm:p-10 space-y-8">
              <div className="space-y-8">
                {/* Test Instructions & Rules */}
                <div className="space-y-4">
                   <h2 className="text-xl sm:text-2xl font-black text-indigo-400 uppercase tracking-widest text-center sm:text-left">Test Instructions & Rules</h2>
                   <div className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5 shadow-inner">
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> The test will not start until you grant the required permissions.</p>
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> Once permission is given, the quiz will begin immediately.</p>
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> During the test, switching tabs or visiting other websites is strictly monitored.</p>
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> If you switch tabs more than 3 times, you will receive a warning.</p>
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> If this behavior continues beyond the allowed limit, the test will be automatically closed.</p>
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> In such a case, you will be restricted from accessing the test for 3 days.</p>
                      <p className="flex gap-3"><span className="text-indigo-500">•</span> After 3 days, you will be allowed to take the test again.</p>
                   </div>
                </div>

                {/* Examination Guidelines */}
                <div className="space-y-4">
                   <h2 className="text-xl sm:text-2xl font-black text-indigo-400 uppercase tracking-widest text-center sm:text-left">Examination Guidelines</h2>
                   <div className="grid grid-cols-1 gap-4 bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5 shadow-inner">
                      {[
                        "The test will only begin after all required permissions are granted.",
                        "Once permissions are approved, the exam will start immediately.",
                        "Candidates must remain on the test screen throughout the duration of the exam.",
                        "Any attempt to switch tabs, minimize the window, or navigate away will be recorded.",
                        "A maximum of 3 such violations is allowed.",
                        "Exceeding this limit will result in immediate termination of the test.",
                        "In case of termination, the candidate will be restricted from accessing the exam for a period of 3 days.",
                        "Access will be restored automatically after the restriction period."
                      ].map((rule, idx) => (
                        <div key={idx} className="flex gap-4 text-sm sm:text-base text-gray-400 group">
                           <span className="text-indigo-500 font-black shrink-0 transition-transform group-hover:scale-110">{idx + 1}.</span>
                           <span className="group-hover:text-gray-200 transition-colors">{rule}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <p className="text-center text-[10px] sm:text-xs text-red-400 font-black uppercase tracking-widest">
                    ⚠️ Strict compliance is required to avoid instant disqualification
                  </p>
                </div>
              </div>
           </div>

           <div className="p-6 sm:px-10 pb-8 border-t border-white/10 bg-gray-900/50 backdrop-blur-xl sticky bottom-0 z-20 rounded-b-2xl">
              {!isCameraActive ? (
                <button 
                  onClick={handleEnableCamera}
                  className="w-full py-5 bg-white text-gray-900 font-black rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]"
                >
                  Permit Camera Access
                </button>
              ) : (
                <button 
                  onClick={handleStartTest}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/25 active:scale-[0.98]"
                >
                  Start Proctored Test
                </button>
              )}
           </div>
        </Card3D>
      </div>
    );
  }

  // Lives Display
  const renderLives = () => (
    <div className="flex gap-1.5 sm:gap-2">
      {[1, 2, 3].map((i) => (
        <motion.div
           key={i}
           animate={i > lives ? { scale: [1, 1.5, 0], opacity: 0 } : { scale: 1, opacity: 1 }}
        >
          <Heart 
            className={`w-6 h-6 sm:w-8 sm:h-8 ${i <= lives ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </motion.div>
      ))}
    </div>
  );

  // Results Screen
  if (isCompleted || isGameOver) {
    return (
      <div className="max-w-full sm:max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-0">
        <Card3D className="bg-white dark:bg-[#0f172a]/90 border-gray-200 dark:border-white/10 p-5 sm:p-8 text-center space-y-6 sm:space-y-8">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto relative"
            >
              <motion.div
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute inset-0 bg-white/10 rounded-full"
              />
              {isCompleted ? <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 relative z-10" /> : <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 relative z-10" />}
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white">
                {isCompleted ? 'Quiz Completed!' : 'Game Over'}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300">
                You scored <span className="text-indigo-600 dark:text-indigo-400 font-bold">{score}</span> points
              </p>
            </div>
 
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
               <div className="p-3 sm:p-4 rounded-xl bg-gray-700/50">
                 <div className="text-[10px] sm:text-sm text-gray-400 uppercase">Correct</div>
                 <div className="text-xl sm:text-2xl font-bold text-green-400">
                   {isCompleted ? Math.round(score / quiz.pointsPerQuestion) : '—'} / {totalQuestions}
                 </div>
               </div>
               <div className="p-3 sm:p-4 rounded-xl bg-gray-700/50">
                 <div className="text-[10px] sm:text-sm text-gray-400 uppercase">Status</div>
                 <div className={`text-xl sm:text-2xl font-bold ${isCompleted ? 'text-yellow-400' : 'text-red-400'}`}>
                   {isCompleted ? 'Victory' : 'Defeated'}
                 </div>
               </div>
            </div>
 
            <div className="flex flex-col gap-3 pt-4 sm:pt-6">
              <button 
                onClick={() => navigate('/quizzes')}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-gray-100 dark:bg-[#1e293b] text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-[#334155] transition-colors text-sm sm:text-base"
              >
                Back to Quizzes
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
              >
                Go to Dashboard
              </button>
            </div>
        </Card3D>
      </div>
    );
  }
 
  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-0">
      {/* Proctoring Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-gray-900/50 border border-indigo-500/20 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="w-32 h-24 sm:w-40 sm:h-30 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-lg relative">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover bg-black" 
          />
          <div className="absolute top-1 left-1 flex items-center gap-1.5 bg-black/50 px-1.5 py-0.5 rounded">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[8px] text-white font-bold uppercase tracking-tighter">LIVE</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-row sm:flex-col justify-between items-center sm:items-start w-full gap-2">
           <div className="flex items-center gap-4">
              {renderLives()}
           </div>
           <div className="flex items-center justify-between w-full mt-2">
              <div className="text-indigo-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
                Question {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              <div className="px-3 py-1 bg-indigo-600/20 rounded-full text-indigo-400 font-mono font-bold text-xs">
                {score} PTS
              </div>
           </div>
        </div>
      </div>

      {/* Warning Overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-900 border-2 border-red-500 rounded-2xl p-8 max-w-sm text-center shadow-2xl shadow-red-500/20"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Warning!</h3>
              <p className="text-gray-400 mb-6 font-medium">
                {warningType === 'tab-switch' && "Tab switching is strictly forbidden!"}
                {warningType === 'blur' && "Focus loss detected! Stay on the test window."}
                {warningType === 'fullscreen-exit' && "Full-screen mode is required!"}
                <br />
                <span className="text-red-400 font-bold mt-2 block">Strike {violations} of 3</span>
              </p>
              <button 
                onClick={() => {
                  setShowWarning(false);
                  document.documentElement.requestFullscreen().catch(e => console.error(e));
                }}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-red-600/30"
              >
                I Understand
              </button>
              <p className="mt-4 text-[10px] text-gray-500 uppercase font-bold tracking-tighter">One more violation may result in a 3-day ban</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] relative"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
        >
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </motion.div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode='wait'>
        <motion.div
           key={currentQuestionIndex}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
        >
          <Card3D className="glass-card p-5 sm:p-8 min-h-[350px] sm:min-h-[400px] flex flex-col justify-between">
             <div className="space-y-4 sm:space-y-6">
               <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                 {currentQuestion.question}
               </h2>
               
               <div className="space-y-3">
                   {currentQuestion.options.map((option, index) => {
                   let stateStyles = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600";
                   
                   if (selectedOption === index) {
                     stateStyles = "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/20";
                   }
                   
                   if (feedback) {
                      if (index === currentQuestion.answerIndex) {
                        stateStyles = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300";
                      } else if (selectedOption === index) {
                        stateStyles = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300";
                      } else {
                        stateStyles = "opacity-50 bg-gray-50 dark:bg-[#1e293b]/50 border-transparent text-gray-400";
                      }
                   }

                   return (
                     <motion.button
                       key={index}
                       onClick={() => handleAnswer(index)}
                       disabled={!!feedback}
                       whileHover={!feedback ? { scale: 1.02, x: 5 } : {}}
                       whileTap={!feedback ? { scale: 0.98 } : {}}
                       className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-colors duration-200 relative overflow-hidden group/opt ${stateStyles}`}
                     >
                        <span className={`opacity-70 mr-3 font-bold ${selectedOption === index ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                     </motion.button>
                   );
                 })}
               </div>
             </div>

             {/* Footer / Explanation */}
             {feedback && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-6 pt-6 border-t border-white/10"
               >
                 <div className={`p-4 rounded-xl mb-4 ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                   <p className={`font-bold text-lg mb-1 ${feedback === 'correct' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                     {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                   </p>
                   {currentQuestion.explanation && (
                     <p className="text-gray-700 dark:text-gray-300 text-sm">
                       {currentQuestion.explanation}
                     </p>
                   )}
                 </div>
                 
                 <button
                   onClick={nextQuestion}
                   className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
                 >
                   {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                   <ArrowRight className="w-5 h-5" />
                 </button>
               </motion.div>
             )}
          </Card3D>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
