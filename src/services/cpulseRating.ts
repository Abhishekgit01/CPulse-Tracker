export function calculateCPulseRating(user: {
  rating?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  stars?: number;
  problemsSolved?: number;
  updatedAt?: Date;
}) {
  // Codeforces rating contribution (0-1200 points)
  const cfRating = user.rating ?? 0;
  const cfScore = Math.min(
    Math.max(((cfRating - 800) / 2700) * 1200, 0),
    1200
  );

  // LeetCode problems contribution (0-600 points)
  const rawLC =
    (user.easySolved ?? 0) * 1 +
    (user.mediumSolved ?? 0) * 3 +
    (user.hardSolved ?? 0) * 7;
  const lcScore = Math.min((rawLC / 3000) * 600, 600);

  // CodeChef rating contribution (0-1200 points, similar to Codeforces)
  // CodeChef ratings typically range from 0 to 3500+
  const ccRating = user.rating ?? 0;
  const ccScore = Math.min(
    Math.max(((ccRating - 800) / 2700) * 1200, 0),
    1200
  );

  // CodeChef stars bonus (0-100 points)
  // Stars range from 1★ to 7★
  const starsBonus = (user.stars ?? 0) * 14; // Max 98 points for 7 stars

  // CodeChef problems solved contribution (0-600 points)
  const ccProblems = user.problemsSolved ?? 0;
  const ccProblemsScore = Math.min((ccProblems / 500) * 600, 600);

  // Determine which platform this user is from and calculate base score
  let skillScore = 0;
  let consistencyScore = 0;

  if (cfRating > 0) {
    // Codeforces user
    skillScore = cfScore;
    consistencyScore = lcScore; // If they also have LeetCode data
  } else if (ccRating > 0) {
    // CodeChef user
    skillScore = ccScore + starsBonus;
    consistencyScore = ccProblemsScore;
  } else {
    // LeetCode only user
    skillScore = lcScore;
    consistencyScore = 0;
  }

  // Activity multiplier based on last update
  const daysSinceActive = user.updatedAt
    ? (Date.now() - new Date(user.updatedAt).getTime()) /
    (1000 * 60 * 60 * 24)
    : 999;

  const activityMultiplier =
    daysSinceActive <= 7 ? 1.05 :
      daysSinceActive <= 30 ? 1 :
        daysSinceActive <= 90 ? 0.95 :
          0.85;

  return Math.round(
    (skillScore + consistencyScore) * activityMultiplier
  );
}
