import { useAuth } from '../context/AuthContext';
import { Card3D } from '../components/Card3D';
import { motion } from 'framer-motion';
import { getBadgeIcon } from '../utils/badges';
import { Coins, Award, Zap } from 'lucide-react';

const Rewards = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const stats = [
    { label: 'Total Coins', value: user.coins || 0, icon: Coins, color: 'text-yellow-400' },
    { label: 'Badges Earned', value: user.badges?.length || 0, icon: Award, color: 'text-purple-400' },
    { label: 'Current Streak', value: `${user.streak || 0} Days`, icon: Zap, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 px-2 sm:px-0">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card3D className="glass-card !bg-white dark:!bg-[#0f172a]/60 p-6 text-center border-gray-100 dark:border-white/5 hover:border-indigo-500/30">
              <div className={`mx-auto w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center mb-4 ${stat.color} ring-1 ring-gray-100 dark:ring-white/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      {/* Badges Gallery */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Award className="text-indigo-400" />
          YOUR BADGE COLLECTION
        </h2>
        
        {(!user.badges || user.badges.length === 0) ? (
          <div className="p-8 sm:p-12 text-center border-2 border-dashed border-gray-700 dark:border-gray-500 rounded-3xl opacity-50">
            <p className="text-gray-500 dark:text-gray-400">Complete quizzes to unlock your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {user.badges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: i * 0.05 }}
              >
                <div className="relative group perspective-1000">
                   <div className="glass-card !bg-white dark:!bg-[#0f172a]/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-4 hover:shadow-indigo-500/20 hover:-translate-y-2">
                     <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-full shadow-inner ring-1 ring-gray-100 dark:ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                       <div className="w-8 h-8 flex items-center justify-center">
                         {getBadgeIcon(badge)}
                       </div>
                     </div>
                     <span className="font-bold text-center text-sm text-gray-900 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                       {badge}
                     </span>
                   </div>
                   {/* Shine effect */}
                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;
