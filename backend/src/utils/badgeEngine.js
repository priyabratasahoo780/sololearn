const checkBadges = (user, quizResult = null) => {
  const newBadges = [];
  const existingBadges = new Set(user.badges);

  // Helper to add badge if not exists
  const award = (badgeName) => {
    if (!existingBadges.has(badgeName)) {
      newBadges.push(badgeName);
      user.badges.push(badgeName);
    }
  };

  // Rule 1: Quiz Rookie (First Quiz)
  if (user.quizzesAttempted.length === 1) {
    award('Quiz Rookie');
  }

  // Rule 2: Streak Hero (5 Quizzes Total)
  if (user.quizzesAttempted.length >= 5) {
    award('Streak Hero');
  }
  
  // Rule 3: Perfect Score
  if (quizResult && quizResult.scorePercent === 100) {
    award('Perfect Score');
  }

  // Rule 4: Category Master (80% score in a category)
  // Logic: Check if current quiz score >= 80%
  if (quizResult && quizResult.scorePercent >= 80 && quizResult.category) {
    award(`${quizResult.category} Master`);
  }

  return newBadges;
};

module.exports = { checkBadges };
