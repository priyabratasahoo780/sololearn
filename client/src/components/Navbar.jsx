import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, User, LogOut, Code2, Trophy, Award, LayoutDashboard, FileText, Globe, Settings } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const langs = ['en', 'es', 'fr'];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const navLinks = [
    { path: '/', label: t('home'), icon: null },
    { path: '/quizzes', label: t('quizzes'), icon: null },
    { path: '/feed', label: 'Feed', icon: Globe },
    { path: '/leaderboard', label: t('leaderboard'), icon: Trophy },
    { path: '/rewards', label: t('rewards'), icon: Award },
    { path: '/certificates', label: t('certificates'), icon: FileText },
  ];

  if (user) {
    navLinks.push({ path: '/create-quiz', label: t('create'), icon: null });
  }

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300">
      <div className="mx-2 sm:mx-4 mt-2 sm:mt-4">
        <div className="glass-panel rounded-2xl px-4 sm:px-6 lg:px-8 border border-white/10 dark:border-white/5 shadow-2xl">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="flex items-center gap-4 lg:gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-1.5 sm:p-2 rounded-lg shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                  <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  SoloLearn
                </span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                        ${isActive ? 'text-indigo-600 dark:text-white bg-indigo-50/50 dark:bg-white/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
                      `}
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-indigo-500/5 dark:bg-white/10 rounded-md -z-10 border border-indigo-500/10 dark:border-white/5"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative group"
                title="Switch Language"
              >
                <Globe className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-500 text-[8px] text-white font-bold">
                  {language.toUpperCase()}
                </span>
              </button>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-white/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block">{user.name}</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors"
                    title="Profile Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all mr-1"
              >
                <span className="text-[10px] font-black">{language.toUpperCase()}</span>
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all transform hover:scale-105 active:scale-95"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="md:hidden fixed top-0 right-0 h-full w-[280px] bg-[#0f1020] border-l border-white/10 shadow-2xl z-[100] p-6 pt-24"
            >
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all
                      ${location.pathname === link.path ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
                
                {user && (
                  <div className="pt-4 mt-4 border-t border-white/5 flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Settings className="w-5 h-5" />
                      Profile Settings
                    </Link>
                  </div>
                )}
              </div>

              <div className="absolute bottom-10 left-6 right-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-white truncate">{user.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Premium Member</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-4 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
