import { useEffect, useState } from 'react';
import { ShieldAlert, Home, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityWrapper = ({ children }) => {
  const [isViolation, setIsViolation] = useState(false);

  useEffect(() => {
    // ---- ONLY trigger on explicit user actions ----

    // 1. Block Right-Click and show overlay
    const handleContextMenu = (e) => {
      e.preventDefault();
      setIsViolation(true);
    };

    // 2. Block DevTools keyboard shortcuts and show overlay
    const handleKeyDown = (e) => {
      const isMac = /Mac|iPhone|iPad/i.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      const isViolationKey =
        e.key === 'F12' ||
        e.keyCode === 123 ||
        (cmdOrCtrl && e.key.toLowerCase() === 'u') ||
        (cmdOrCtrl && shift && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        (isMac && cmdOrCtrl && alt && e.key.toLowerCase() === 'i');

      if (isViolationKey) {
        e.preventDefault();
        setIsViolation(true);
      }
    };

    // 3. Detect DevTools open via window size difference (docked panel detection)
    const DEVTOOLS_THRESHOLD = 160;
    const checkDevToolsOpen = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD) {
        setIsViolation(true);
      }
    };
    const devToolsInterval = setInterval(checkDevToolsOpen, 1000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsInterval);
    };
  }, []);

  const handleGoHome = () => {
    setIsViolation(false);
    window.location.href = '/';
  };

  return (
    <>
      <AnimatePresence>
        {isViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#030712]/95 backdrop-blur-md flex items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 20 }}
              className="max-w-xl w-full relative"
            >
              {/* Card with Intense Glow */}
              <div className="relative p-1 rounded-[40px] bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="bg-[#0f172a]/95 p-10 sm:p-14 rounded-[38px] backdrop-blur-3xl relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                  
                  {/* Red Shield Security Icon */}
                  <div className="relative mb-10">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto relative z-10 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], filter: ["drop-shadow(0 0 5px rgba(239,68,68,0.5))", "drop-shadow(0 0 15px rgba(239,68,68,0.8))", "drop-shadow(0 0 5px rgba(239,68,68,0.5))"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                      </motion.div>
                    </div>
                    {/* Pulsing rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/5 rounded-full blur-xl animate-pulse" />
                  </div>
 
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight uppercase font-serif">
                    Security Protocol Active
                  </h1>
                  
                  <p className="text-slate-400 text-base sm:text-lg mb-10 leading-relaxed font-medium">
                    Source code inspection and developer tools have been disabled to protect the integrity of the platform.
                  </p>
                  
                  {/* Glowing Gradient Neon Button */}
                  <button
                    onClick={handleGoHome}
                    className="w-full relative group transition-all duration-300 active:scale-95"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x" />
                    <div className="relative flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black py-5 px-10 rounded-2xl transition duration-200 shadow-xl">
                      <Home className="w-6 h-6 shadow-[0_0_15px_rgba(165,180,252,0.4)]" />
                      <span className="text-lg uppercase tracking-wider">Go to Home</span>
                    </div>
                  </button>
                  
                  {/* Footer Text */}
                  <div className="mt-10 flex items-center justify-center gap-2.5 text-[11px] text-slate-500 font-extrabold uppercase tracking-[0.3em] opacity-50">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Protected Content</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        {children}
      </div>
    </>
  );
};

export default SecurityWrapper;
