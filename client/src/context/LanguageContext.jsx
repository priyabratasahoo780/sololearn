import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    welcome: 'Welcome',
    masterCoding: 'Master Coding',
    premiumWay: 'The Premium Way',
    getStarted: 'Get Started Free',
    exploreQuizzes: 'Explore Quizzes',
    dashboard: 'Dashboard',
    quizzes: 'Quizzes',
    leaderboard: 'Leaderboard',
    rewards: 'Rewards',
    certificates: 'Certificates',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    resumeLearning: 'Resume Learning',
    totalPoints: 'Total Points',
    dailyStreak: 'Daily Streak',
    badges: 'Badges',
    quizzesDone: 'Quizzes Done',
    recommended: 'Recommended for You',
    viewAll: 'View All',
    createChallenge: 'Create Your Challenge',
    startCreating: 'Start Creating',
    rateUs: 'Rate Us',
    whatLearnersSay: 'What Our Learners Say',
    interactiveQuizzes: 'Interactive Quizzes',
    globalLeaderboards: 'Global Leaderboards',
    communityDriven: 'Community Driven',
    activeLearners: 'Active Learners',
    techCategories: 'Tech Categories',
    quizzesTaken: 'Quizzes Taken'
  },
  es: {
    welcome: 'Bienvenido',
    masterCoding: 'Domina la Programación',
    premiumWay: 'De Manera Premium',
    getStarted: 'Empieza Gratis',
    exploreQuizzes: 'Explorar Cuestionarios',
    dashboard: 'Tablero',
    quizzes: 'Cuestionarios',
    leaderboard: 'Clasificación',
    rewards: 'Recompensas',
    certificates: 'Certificados',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    resumeLearning: 'Reanudar Aprendizaje',
    totalPoints: 'Puntos Totales',
    dailyStreak: 'Racha Diaria',
    badges: 'Insignias',
    quizzesDone: 'Cuestionarios Completados',
    recommended: 'Recomendado para Ti',
    viewAll: 'Ver Todo',
    createChallenge: 'Crea tu Desafío',
    startCreating: 'Empezar a Crear',
    rateUs: 'Califícanos',
    whatLearnersSay: 'Lo que dicen nuestros estudiantes',
    interactiveQuizzes: 'Cuestionarios Interactivos',
    globalLeaderboards: 'Clasificaciones Globales',
    communityDriven: 'Impulsado por la Comunidad',
    activeLearners: 'Estudiantes Activos',
    techCategories: 'Categorías Técnicas',
    quizzesTaken: 'Cuestionarios Tomados'
  },
  fr: {
    welcome: 'Bienvenue',
    masterCoding: 'Maîtrisez le Code',
    premiumWay: 'La Façon Premium',
    getStarted: 'Commencer Gratuitement',
    exploreQuizzes: 'Explorer les Quiz',
    dashboard: 'Tableau de Bord',
    quizzes: 'Quiz',
    leaderboard: 'Classement',
    rewards: 'Récompenses',
    certificates: 'Certificats',
    login: 'Connexion',
    signup: 'S\'inscrire',
    logout: 'Déconnexion',
    resumeLearning: 'Reprendre l\'apprentissage',
    totalPoints: 'Points Totaux',
    dailyStreak: 'Série Quotidienne',
    badges: 'Badges',
    quizzesDone: 'Quiz Terminés',
    recommended: 'Recommandé pour Vous',
    viewAll: 'Voir Tout',
    createChallenge: 'Créez votre Défi',
    startCreating: 'Commencer à Créer',
    rateUs: 'Évaluez-nous',
    whatLearnersSay: 'Ce que disent nos apprenants',
    interactiveQuizzes: 'Quiz Interactifs',
    globalLeaderboards: 'Classements Mondiaux',
    communityDriven: 'Piloté par la Communauté',
    activeLearners: 'Apprenants Actifs',
    techCategories: 'Catégories Techniques',
    quizzesTaken: 'Quiz Passés'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    // Ensure saved language exists in translations, else default to 'en'
    return translations[saved] ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    // Safety check: if language doesn't exist in translations, fallback to en
    const langData = translations[language] || translations['en'];
    return langData[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
