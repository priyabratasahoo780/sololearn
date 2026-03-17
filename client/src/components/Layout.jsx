import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const toastStyle = {
    background: 'rgba(30, 41, 59, 0.9)',
    backdropFilter: 'blur(8px)',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30 transition-colors duration-300">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </div>
      <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />
    </div>
  );
};

export default Layout;
