import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card3D } from '../components/Card3D';
import { Play, TrendingUp, Award, Zap, ArrowRight, Target, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import ReviewForm from '../components/ReviewForm';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  if (!user) return null;

  return (
    <div className="space-y-10">
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full p-2 shadow-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <ReviewForm onClose={() => setShowReviewModal(false)} />
          </div>
        </div>
      )}

      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-12 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              Welcome back,<br className="sm:hidden" /> {user.name}!
            </h1>
            <p className="text-indigo-100 text-base sm:text-lg max-w-md">
              Ready to continue your learning journey and climb the ranks?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             <button
              onClick={() => setShowReviewModal(true)}
              className="group flex flex-1 items-center justify-center gap-2 bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 px-6 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-sm sm:text-base"
            >
              <MessageSquare className="w-5 h-5" />
              Rate Us
            </button>
            <Link
              to="/quizzes"
              className="group flex flex-1 items-center justify-center gap-2 bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume Learning
            </Link>
          </div>
        </div>
        {/* Decorative Background Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl opacity-50 sm:opacity-100" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-black/10 blur-2xl opacity-50 sm:opacity-100" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card3D className="bg-white dark:bg-[#0f172a]/60 p-5 sm:p-6 border-l-4 border-indigo-500 shadow-xl dark:border-indigo-500/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Total Points</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">{user.totalPoints || 0}</p>
            </div>
          </div>
        </Card3D>
        
        <Card3D className="bg-white dark:bg-[#0f172a]/60 p-5 sm:p-6 border-l-4 border-yellow-500 shadow-xl dark:border-yellow-500/50">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Daily Streak</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">{user.streak || 0} Days</p>
            </div>
          </div>
        </Card3D>

        <Card3D className="bg-white dark:bg-[#0f172a]/60 p-5 sm:p-6 border-l-4 border-purple-500 shadow-xl dark:border-purple-500/50">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Badges</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">{user.badges?.length || 0}</p>
            </div>
          </div>
        </Card3D>

        <Card3D className="bg-white dark:bg-[#0f172a]/60 p-5 sm:p-6 border-l-4 border-pink-500 shadow-xl dark:border-pink-500/50">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Quizzes Done</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">{user.quizzesAttempted?.length || 0}</p>
            </div>
          </div>
        </Card3D>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card3D className="bg-white dark:bg-[#0f172a]/60 p-5 sm:p-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">XP Growth</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Mon', xp: 400 },
                { name: 'Tue', xp: 300 },
                { name: 'Wed', xp: 550 },
                { name: 'Thu', xp: 450 },
                { name: 'Fri', xp: 600 },
                { name: 'Sat', xp: 800 },
                { name: 'Sun', xp: user.totalPoints || 950 }
              ]}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.05} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card3D>

        <Card3D className="bg-white dark:bg-[#0f172a]/60 p-5 sm:p-6">
           <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Skill Proficiency</h3>
           <div className="h-64 sm:h-80">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                 { subject: 'JS', A: 120, fullMark: 150 },
                 { subject: 'React', A: 98, fullMark: 150 },
                 { subject: 'CSS', A: 86, fullMark: 150 },
                 { subject: 'Node', A: 99, fullMark: 150 },
                 { subject: 'DB', A: 85, fullMark: 150 },
                 { subject: 'UI', A: 65, fullMark: 150 },
               ]}>
                 <PolarGrid stroke="#374151" opacity={0.1} />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                 <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                 <Radar name="My Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </Card3D>
      </div>

      {/* Recent Activity / Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
            <Link to="/quizzes" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Hardcoded Recommendations for Demo - ideally this reads dynamic quizzes */}
            {['React Fundamentals', 'JavaScript Core', 'CSS Styling'].map((title, i) => (
              <Card3D key={i} className="bg-white dark:bg-[#0f172a]/60 hover:bg-gray-50 dark:hover:bg-[#1e293b]/80 p-4 group cursor-pointer border border-gray-200 dark:border-transparent">
                <Link to="/quizzes" className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-gray-600 dark:text-indigo-200 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                      {title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{title}</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Intermediate • 150 Points</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-600 dark:border-indigo-400/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                    <Play className="w-4 h-4 text-indigo-400 fill-current" />
                  </div>
                </Link>
              </Card3D>
            ))}
          </div>
        </div>

        {/* Create Quiz Promot */}
        <div className="relative rounded-3xl bg-white dark:bg-[#0f172a]/50 border border-gray-200 dark:border-white/5 p-8 flex flex-col justify-center items-center text-center space-y-6 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 dark:from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Your Challenge</h3>
              <p className="text-gray-600 dark:text-slate-400 max-w-xs mx-auto">
                Craft your own quizzes and challenge the community. Earn badges for contributions!
              </p>
            </div>
            <Link 
              to="/create-quiz"
              className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-indigo-900/30 hover:bg-gray-200 dark:hover:bg-indigo-900/50 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-indigo-500/30 hover:border-gray-300 dark:hover:border-indigo-500/50 transition-all"
            >
              Start Creating
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
