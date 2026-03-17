import { useState, useMemo, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

import { Card3D } from '../components/Card3D';
import { Link } from 'react-router-dom';
import { Search, Filter, Play, Code2, Database, Coffee, Layers, Globe, Lock, Unlock, Coins } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Layers },
  { name: 'HTML', icon: Globe },
  { name: 'CSS', icon: Code2 },
  { name: 'JavaScript', icon: Code2 },
  { name: 'ReactJS', icon: Code2 },
  { name: 'NextJs', icon: Code2 },
  { name: 'AngularJS', icon: Code2 },
  { name: 'Java', icon: Coffee },
  { name: 'SQL', icon: Database },
  { name: 'NoSQL', icon: Database },
];

const QuizList = () => {
  const { user, refreshUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [unlockingId, setUnlockingId] = useState(null);
  
  // Real-time fetch
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get('/quizzes');
        setQuizzes(data.data);
      } catch (err) {
        console.error('Failed to fetch quizzes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleUnlock = async (quiz) => {
    if (unlockingId) return;
    
    if (user.coins < quiz.unlockCost) {
      toast.error(`Not enough coins! You need ${quiz.unlockCost} coins.`);
      return;
    }

    if (!confirm(`Unlock "${quiz.title}" for ${quiz.unlockCost} coins?`)) return;

    setUnlockingId(quiz._id);
    try {
      await api.post(`/quizzes/${quiz._id}/unlock`);
      await refreshUser();
      toast.success(`"${quiz.title}" unlocked!`);
    } catch (err) {
      console.error('Unlock failed', err);
      toast.error(err.response?.data?.message || 'Unlock failed');
    } finally {
      setUnlockingId(null);
    }
  };

  // Filter Logic
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || quiz.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [quizzes, searchTerm, activeCategory]);

  return (
    <div className="space-y-8 min-h-screen">
      {/* Header & Controls */}
      <div className="space-y-6">
        <div className="px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">Explore Challenges</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm sm:text-base">Test your skills, earn coins, and reach the top of the leaderboard.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 px-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full !bg-white dark:!bg-[#1e293b]/60 border !border-gray-200 dark:!border-white/5 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xl shadow-indigo-500/5 font-medium"
            />
          </div>
        </div>

        {/* Category Tags with fading edges */}
        <div className="relative group px-2">
          <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {CATEGORIES.map((cat) => (
               <button
                 key={cat.name}
                 onClick={() => setActiveCategory(cat.name)}
                 className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all snap-start
                   ${activeCategory === cat.name 
                     ? '!bg-indigo-600 !text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/50' 
                     : '!bg-white dark:!bg-[#1e293b]/50 !text-gray-600 dark:!text-gray-400 hover:!bg-gray-100 dark:hover:!bg-white/5 border !border-gray-200 dark:!border-white/5 shadow-sm'
                   }`}
               >
                 <cat.icon className="w-4 h-4" />
                 {cat.name}
               </button>
            ))}
          </div>
          {/* Fading Edge Indicators */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#0f1020] to-transparent pointer-events-none hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => {
            const isPremium = quiz.isPremium;
            const isLocked = isPremium && user && !user.unlockedQuizzes?.includes(quiz._id);

            return (
              <Card3D key={quiz._id} className="glass-card p-6 flex flex-col justify-between group h-full hover:border-indigo-500/30">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${quiz.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 
                        quiz.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 
                        'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                      {quiz.difficulty || 'Intermediate'}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-gray-500 text-xs font-mono mb-1">{quiz.category}</span>
                      {isPremium && (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                          <Coins className="w-3 h-3" />
                          {quiz.unlockCost}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                       {quiz.title}
                       {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {quiz.questions?.length || 0} Questions
                  </div>
                  
                  {isLocked ? (
                    <button
                      onClick={() => handleUnlock(quiz)}
                      disabled={unlockingId === quiz._id}
                      className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-700 text-white flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-gray-800 transition-all"
                    >
                      {unlockingId === quiz._id ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Unlock
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={`/quizzes/${quiz._id}`}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform hover:shadow-indigo-500/30"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </Link>
                  )}
                </div>
              </Card3D>
            );
          })
        ) : (
           <div className="col-span-full py-24 text-center text-gray-400">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <Filter className="w-8 h-8 opacity-50 text-gray-600 dark:text-gray-400" />
             </div>
             <p className="text-lg text-gray-600 dark:text-gray-400">No quizzes found for these filters.</p>
             <button 
               onClick={() => {setSearchTerm(''); setActiveCategory('All');}}
               className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold"
             >
               Clear filters
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
