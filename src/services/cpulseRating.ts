export function calculateCPulseRating(user: {
  rating?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  updatedAt?: Date;
}) {
  const cfRating = user.rating ?? 0;

  const skillScore = Math.min(
    Math.max(((cfRating - 800) / 2700) * 1200, 0),
    1200
  );

  const rawLC =
    (user.easySolved ?? 0) * 1 +
    (user.mediumSolved ?? 0) * 3 +
    (user.hardSolved ?? 0) * 7;

  const consistencyScore = Math.min((rawLC / 3000) * 600, 600);

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
