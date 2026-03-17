import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/reviews');
        setReviews(data.data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-12">
      <div className="flex gap-4 sm:gap-6 animate-scroll whitespace-nowrap px-4 hover:[animation-play-state:paused]">
        {/* Double the list for seamless loop */}
        {[...reviews, ...reviews].map((review, i) => (
          <div 
            key={`${review._id}-${i}`}
            className="inline-block w-72 sm:w-80 md:w-96 p-5 sm:p-6 rounded-2xl glass-card bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl whitespace-normal flex-shrink-0 mx-2 sm:mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{review.user.name}</h4>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm italic line-clamp-3">"{review.comment}"</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ReviewsCarousel;
