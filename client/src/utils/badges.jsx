import { Award, Zap, BookOpen, Star, Shield, Trophy } from 'lucide-react';

export const BADGE_ICONS = {
  "Quiz Rookie": <Star className="text-yellow-400" />,
  "HTML Master": <BookOpen className="text-orange-500" />,
  "JS Champion": <Zap className="text-yellow-500" />,
  "React Pro": <Shield className="text-blue-400" />,
  "Streak Hero": <Zap className="text-purple-500" />,
  "Default": <Award className="text-indigo-400" />
};

export const getBadgeIcon = (name) => {
  return BADGE_ICONS[name] || BADGE_ICONS['Default'];
};
