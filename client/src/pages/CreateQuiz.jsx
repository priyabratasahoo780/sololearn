import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

import { toast } from 'react-hot-toast'; // Updated to react-hot-toast
import { Plus, Trash2, Save, X, Settings, CheckCircle, Lock, Unlock } from 'lucide-react';
import { Card3D } from '../components/Card3D';

const CreateQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HTML');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' }
  ]);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const ADMIN_SECRET = "ADMIN123"; // Simple password system as requested

  const handleUnlock = (e) => {
    e.preventDefault();
    if (adminPassword === ADMIN_SECRET) {
      if (user?.role !== 'admin') {
         toast.error('Admin password correct, but your account is not an AdminRole. Check Profile.');
         // Optional: proceed anyway if user strictly wants password-only access, 
         // but best to check both.
         // For now, let's just use password for "CON ACCESS" as requested.
      }
      setIsAdminUnlocked(true);
      toast.success('Admin Access Granted!');
    } else {
      toast.error('Incorrect Admin Password');
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Admin Access Only</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Please enter the administrator password to access this section.</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center tracking-widest font-mono"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              Unlock Section
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Please fill in title and description');
      return;
    }
    
    // Validate all questions
    for (const q of questions) {
      if (!q.question || q.options.some(o => !o)) {
        toast.error('Please fill in all questions and options');
        return;
      }
    }

    const newQuiz = {
      id: Date.now().toString(),
      title,
      description,
      category,
      difficulty,
      createdBy: user.name,
      createdById: user.id,
      createdAt: new Date().toISOString(),
      pointsPerQuestion: 10, // Default
      questions
    };


// ...

    try {
      // API call to create quiz
      await api.post('/quizzes', newQuiz);
      toast.success('Challenge Created Successfully!', { icon: '🚀' });
      navigate('/quizzes');
    } catch (err) {
      console.error('Failed to create quiz:', err);
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-4 sm:px-0">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Create Challenge</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Contribute to the community and earn badges.</p>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all text-sm sm:text-base"
        >
          <Save className="w-5 h-5" />
          Publish Challenge
        </button>
      </div>      <div className="grid gap-4 sm:gap-8 px-4 sm:px-0">
        {/* Quiz Metadata */}
        <div className="glass-panel p-5 sm:p-8 rounded-[32px] bg-white/60 dark:bg-[#0f172a]/40 border border-gray-200 dark:border-white/10 shadow-2xl shadow-indigo-500/5">
           <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
             <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 animate-spin-slow" />
             General Settings
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
             <div className="space-y-2">
               <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Challenge Title</label>
               <input
                 type="text"
                 className="w-full bg-white dark:bg-[#1e293b]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold placeholder:text-gray-400"
                 placeholder="e.g. Master React Hooks"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category</label>
               <select
                 className="w-full bg-white dark:bg-[#1e293b]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold appearance-none cursor-pointer"
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
               >
                 {['HTML', 'CSS', 'JavaScript', 'ReactJS', 'NextJs', 'AngularJS', 'Java', 'SQL', 'NoSQL'].map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
             </div>
             <div className="md:col-span-2 space-y-2">
               <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Description</label>
               <textarea
                 className="w-full bg-white dark:bg-[#1e293b]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold min-h-[120px] resize-none placeholder:text-gray-400"
                 placeholder="What will developers learn from this challenge?"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
               />
             </div>
           </div>
        </div>
 
        {/* Questions Editor */}
        <div className="space-y-4 sm:space-y-6">
          {questions.map((q, qIndex) => (
            <Card3D key={qIndex} className="bg-white dark:bg-[#0f172a]/40 p-4 sm:p-6 border-gray-200 dark:border-white/5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider">Question {qIndex + 1}</span>
                <button
                  onClick={() => handleRemoveQuestion(qIndex)}
                  disabled={questions.length === 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full bg-white dark:bg-[#1e293b]/50 border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter your question here..."
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuestion(qIndex, 'answerIndex', oIndex)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${q.answerIndex === oIndex ? 'border-green-500 bg-green-500' : 'border-gray-500 hover:border-gray-300'}`}
                      >
                         {q.answerIndex === oIndex && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                      <input
                        type="text"
                        className={`w-full bg-white dark:bg-[#1e293b]/50 border border-gray-300 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:outline-none
                          ${q.answerIndex === oIndex ? 'focus:ring-green-500 border-green-500/50' : 'focus:ring-indigo-500'}`}
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                 
                 <div className="pt-2">
                   <input
                     type="text"
                     className="w-full bg-gray-900/30 border border-white/5 rounded-lg p-2 text-sm text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                     placeholder="Add an explanation for the correct answer (optional)"
                     value={q.explanation}
                     onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                   />
                 </div>
              </div>
            </Card3D>
          ))}
        </div>

        <button
          onClick={handleAddQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-400 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-[#1e293b]/30 transition-all flex items-center justify-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Another Question
        </button>
      </div>
    </div>
  );
};

export default CreateQuiz;
