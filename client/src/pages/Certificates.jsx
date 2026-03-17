import { useState, useEffect } from 'react';
import api from '../services/api';
import Certificate from '../components/Certificate';
import { Award, Lock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await api.get('/certificates');
        setCertificates(data.data);
      } catch (err) {
        console.error('Failed to fetch certificates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 sm:space-y-8 min-h-screen px-2 sm:px-0">
       <div className="text-center space-y-2 sm:space-y-4">
         <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Your Achievements</h1>
         <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
           Prove your mastery. Earn certificates by scoring 80% or higher on quizzes.
         </p>
       </div>
 
       {certificates.length === 0 ? (
         <div className="text-center py-12 sm:py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 mx-2">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
             <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
           </div>
           <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">No Certificates Yet</h3>
           <p className="text-sm text-gray-500 mb-8 px-4">Complete a quiz with a high score to earn your first certificate!</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 gap-8 sm:gap-12">
            {/* Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {certificates.map((cert) => (
                 <div key={cert._id} className="relative group">
                   <button
                     onClick={() => setSelectedCert(cert)}
                     className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left relative z-0 ${selectedCert?._id === cert._id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-white dark:bg-gray-800'}`}
                   >
                     <Award className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mb-2" />
                     <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-1">{cert.title}</h4>
                     <p className="text-[10px] sm:text-xs text-gray-500">{new Date(cert.issueDate).toLocaleDateString()}</p>
                   </button>
                   
                   {/* Direct Download Button - Always visible on small screens */}
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       window.open(`${api.defaults.baseURL}/certificates/${cert._id}/download`, '_blank');
                     }}
                     className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                     title="Download PDF"
                   >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                   </button>
                 </div>
               ))}
            </div>

            {/* Selected Certificate View */}
            {selectedCert && (
              <div className="bg-gray-100 dark:bg-gray-900/50 p-6 sm:p-8 rounded-3xl flex justify-center">
                 <Certificate certificate={selectedCert} />
              </div>
            )}
         </div>
       )}
    </div>
  );
};

export default Certificates;
