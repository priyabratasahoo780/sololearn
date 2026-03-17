import { Link } from 'react-router-dom';
import { Play, User, Clock } from 'lucide-react';

const QuizCard = ({ quiz }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden group">
      <div className="px-5 py-6 flex flex-col h-full bg-white/50 dark:bg-transparent">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
               {quiz.category || 'General'}
             </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {quiz.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
          <div className="flex items-center">
             <User className="h-4 w-4 mr-1.5 opacity-70" />
             <span className="truncate max-w-[80px]">{quiz.createdBy || 'System'}</span>
          </div>
          <div className="flex items-center">
             <Clock className="h-4 w-4 mr-1.5 opacity-70" />
             <span>{quiz.questions.length} Qs</span>
          </div>
        </div>

        <Link
          to={`/quizzes/${quiz.id}`}
          className="w-full relative overflow-hidden group/btn flex justify-center items-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
        >
          <span className="relative z-10 flex items-center">
            <Play className="h-4 w-4 mr-2 fill-current" />
            Start Quiz
          </span>
        </Link>
      </div>
    </div>
  );
};

export default QuizCard;
