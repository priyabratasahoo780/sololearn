import { useRef, useState } from 'react';
// import html2canvas from 'html2canvas'; // No longer needed
// import jsPDF from 'jspdf'; // No longer needed
import { Download, Award, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const Certificate = ({ certificate }) => {
  const { user } = useAuth();
  const certRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Use the new backend endpoint for official PDF
      const response = await api.get(`/certificates/${certificate._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${certificate.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      // Fallback or error notification could go here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Visual Certificate Card */}
      <div 
        ref={certRef}
        className="relative w-full aspect-[1.414/1] max-w-2xl bg-white dark:bg-slate-900 border-8 border-double border-[#C5A059] p-4 sm:p-12 text-center shadow-2xl overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-[#C5A059] opacity-[0.03] rotate-45 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-[#C5A059] opacity-[0.03] rotate-45 transform -translate-x-1/2 translate-y-1/2" />
        
        {/* Certificate Content */}
        <div className="relative h-full border-2 border-[#C5A059]/30 flex flex-col justify-between py-4 sm:py-8 px-2 sm:px-4">
          <div className="space-y-2 sm:space-y-4">
            <Award className="w-12 h-12 sm:w-16 sm:h-16 text-[#C5A059] mx-auto mb-2" />
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#C5A059] tracking-widest uppercase">
              Certificate of Achievement
            </h2>
            <div className="w-12 sm:w-24 h-0.5 bg-[#C5A059]/50 mx-auto" />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] sm:text-base text-gray-500 font-medium italic">This is to certify that</p>
            <h1 className="text-lg sm:text-4xl font-serif font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {user?.name || 'Student'}
            </h1>
            <p className="text-[10px] sm:text-base text-gray-500 font-medium italic">has successfully completed the</p>
            <h3 className="text-sm sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
              {certificate?.title || 'Course Mastery'}
            </h3>
          </div>

          <div className="flex justify-between items-end px-2 sm:px-8">
            <div className="text-left">
              <div className="w-16 sm:w-32 h-px bg-slate-300 dark:bg-slate-700 mb-1" />
              <p className="text-[8px] sm:text-xs text-gray-400 font-serif">Date of Issue</p>
              <p className="text-[10px] sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                {new Date(certificate?.issueDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#C5A059]/40 flex items-center justify-center">
                 <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#C5A059] flex items-center justify-center text-white shadow-xl rotate-12">
                   <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
                 </div>
              </div>
              <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-black text-[#C5A059] whitespace-nowrap opacity-50">VERIFIED</p>
            </div>

            <div className="text-right">
              <div className="w-16 sm:w-32 h-px bg-slate-300 dark:bg-slate-700 mb-1" />
              <p className="text-[8px] sm:text-xs text-gray-400 font-serif">Instructor</p>
              <p className="text-[10px] sm:text-sm font-bold text-slate-600 dark:text-slate-300 italic">SoloLearn Team</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center gap-2 px-8 py-3 bg-[#C5A059] hover:bg-[#b08d4a] text-white rounded-full shadow-lg hover:shadow-xl transition-all font-bold tracking-wide uppercase text-sm disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download Official PDF
          </>
        )}
      </button>
    </div>
  );
};



export default Certificate;
