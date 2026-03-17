import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Trophy, Medal, Crown } from 'lucide-react';
import { Card3D } from '../components/Card3D';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setUsers(data.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="w-8 h-8 text-yellow-400" fill="currentColor" />;
      case 1: return <Medal className="w-8 h-8 text-gray-300" />;
      case 2: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <span className="text-xl font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.div
           initial={{ scale: 0, rotate: -180 }}
           animate={{ scale: 1, rotate: 0 }}
           transition={{ type: "spring", duration: 1 }}
           className="inline-block"
        >
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto drop-shadow-2xl" />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">
          Global Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Top learners competing for glory</p>
      </div>

      <div className="space-y-4">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card3D className="!bg-white dark:!bg-[#0f172a]/80 border-gray-200 dark:border-indigo-500/10 hover:bg-gray-50 dark:hover:bg-[#1e293b]/90">
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="w-8 sm:w-12 flex justify-center flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-lg ring-2 ring-white dark:ring-white/10
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-orange-500/50' : 
                        index === 1 ? 'bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500 shadow-gray-400/50' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 via-orange-700 to-brown-800 shadow-orange-700/50' :
                        'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/50'}`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm sm:text-lg font-bold truncate ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-400 dark:text-slate-400 whitespace-nowrap">
                        <span>{user.badges?.length || 0} Badges</span>
                        <span>•</span>
                        <span>{user.quizzesAttempted?.length || 0} Quizzes</span>
                      </div>
                    </div>
                  </div>
                </div>
 
                <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
                    {user.totalPoints?.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs font-medium text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">
                    Points
                  </div>
                </div>
              </div>
            </Card3D>
          </motion.div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No active players yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
