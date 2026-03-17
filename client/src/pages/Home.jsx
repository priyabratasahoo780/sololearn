import { Link } from 'react-router-dom';
import { Terminal, Code2, Users, Trophy, Zap, Shield, ArrowRight } from 'lucide-react';
import { Card3D } from '../components/Card3D';
import ReviewsCarousel from '../components/ReviewsCarousel';

import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="space-y-24 pb-12 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center space-y-10 py-12 sm:py-24 relative"
      >
        {/* Advanced Dynamic Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [-20, 20, -20],
              y: [-20, 20, -20],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-indigo-600/20 blur-[80px] sm:blur-[130px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [20, -20, 20],
              y: [20, -20, 20],
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/15 blur-[80px] sm:blur-[130px] rounded-full" 
          />
        </div>
        
        <div className="space-y-6 px-4">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-8 leading-[1.1] sm:leading-[0.9]">
            Master Coding<br />
            <motion.span 
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_auto] filter drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]"
            >
              The Premium Way
            </motion.span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed sm:leading-[1.6] px-2 font-medium">
            Experience the next generation of learning. Interactive 3D quizzes, 
            gamified progress, and a community of elite developers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-6 sm:px-0">
          <Link
            to="/signup"
            className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white font-black text-lg sm:text-xl overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all hover:scale-105 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(79,70,229,0.5)] text-center flex items-center justify-center gap-3"
          >
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </Link>
          <Link
            to="/quizzes"
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white/5 text-white font-black text-lg sm:text-xl hover:bg-white/10 backdrop-blur-xl transition-all border border-white/10 hover:border-indigo-500/40 hover:scale-105 hover:-translate-y-1 shadow-2xl text-center"
          >
            Explore Quizzes
          </Link>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0"
      >
        <FeatureCard 
          icon={Terminal}
          color="text-green-400"
          title="Interactive Quizzes"
          desc="Test your knowledge with thousands of community-curated questions across 10+ tech stacks."
        />
        <FeatureCard 
          icon={Trophy}
          color="text-yellow-400"
          title="Global Leaderboards"
          desc="Compete with developers worldwide. Earn prestige, climb the ranks, and showcase your badges."
        />
        <FeatureCard 
          icon={Users}
          color="text-blue-400"
          title="Community Driven"
          desc="Create your own challenges, share knowledge, and learn from the best in the industry."
        />
      </motion.div>
      
      {/* Reviews Carousel */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="space-y-8 px-4 sm:px-0"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-center text-gray-900 dark:text-white">What Our Learners Say</h2>
        <ReviewsCarousel />
      </motion.div>

      {/* Stats / Trust */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-panel p-8 sm:p-12 rounded-3xl border-t border-gray-200 dark:border-white/10 mx-4 sm:mx-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
          <Stat value="10k+" label="Active Learners" />
          <Stat value="50+" label="Tech Categories" />
          <Stat value="1M+" label="Quizzes Taken" />
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <Card3D className="group p-8 bg-white dark:bg-[#0f172a]/60 border border-gray-200 dark:border-indigo-500/20 h-full hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
    <div className={`w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6 shadow-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-indigo-50 mb-3 group-hover:text-indigo-400 transition-colors">{title}</h3>
    <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
      {desc}
    </p>
  </Card3D>
);

const Stat = ({ value, label }) => (
  <div className="space-y-2">
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-900 to-indigo-500 dark:from-white dark:to-gray-500">
      {value}
    </div>
    <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default Home;
