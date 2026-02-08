/**
 * CPulse Score System v2
 *
 * Calculates a unified score (0-1000) across all linked platforms.
 * Fair for users with 1, 2, or 3 platforms — the score is the weighted
 * average of per-platform scores, so linking fewer platforms doesn't
 * penalize you.
 *
 * Per-platform scoring (each 0-1000):
 *   Codeforces : rating-based (logarithmic curve)
 *   LeetCode   : weighted problem count + contest rating
 *   CodeChef   : rating-based (logarithmic curve) + stars bonus
 *
 * Bonuses (up to +50 on top of 1000):
 *   Activity bonus   : +25 if active within 7 days
 *   Diversity bonus  : +25 if 2+ platforms linked
 */

// ─── Per-platform score helpers ────────────────────────────────────

export interface CodeforcesData {
  rating?: number;
  maxRating?: number;
  contestsAttended?: number;
  totalSolved?: number;
}

export interface LeetCodeData {
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  totalSolved?: number;
  contestRating?: number;
  contestsAttended?: number;
  streak?: number;
  totalActiveDays?: number;
}

export interface CodeChefData {
  rating?: number;
  maxRating?: number;
  stars?: number;
  problemsSolved?: number;
  contestsAttended?: number;
}

/**
 * Piecewise linear interpolation helper.
 * Given breakpoints [[x0,y0],[x1,y1],...] and an input x, returns interpolated y.
 */
function piecewise(x: number, breakpoints: [number, number][]): number {
  if (x <= breakpoints[0][0]) return breakpoints[0][1];
  for (let i = 1; i < breakpoints.length; i++) {
    if (x <= breakpoints[i][0]) {
      const [x0, y0] = breakpoints[i - 1];
      const [x1, y1] = breakpoints[i];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return breakpoints[breakpoints.length - 1][1];
}

/**
 * Codeforces score (0-1000).
 * Piecewise linear mapping aligned with CF rank boundaries:
 *   0     → 0     (unrated)
 *   800   → 100   (Newbie)
 *   1200  → 300   (Pupil)
 *   1400  → 420   (Specialist)
 *   1600  → 540   (Expert)
 *   1900  → 680   (Candidate Master)
 *   2100  → 780   (Master)
 *   2300  → 870   (International Master)
 *   2400  → 910   (Grandmaster)
 *   2600  → 950   (International GM)
 *   3000  → 980
 *   3500  → 1000  (Legendary GM)
 * + contest bonus (0-60) + problems bonus (0-60)
 */
export function codeforcesScore(d: CodeforcesData): number {
  const rating = Math.max(d.rating ?? 0, d.maxRating ?? 0);
  if (rating <= 0 && (d.totalSolved ?? 0) === 0) return 0;

  // Rating component (0-880) via piecewise interpolation
  const ratingScore = piecewise(rating, [
    [0, 0], [800, 80], [1200, 250], [1400, 360],
    [1600, 470], [1900, 600], [2100, 700], [2300, 790],
    [2400, 830], [2600, 860], [3000, 870], [3500, 880],
  ]);
  // cap at 880 for the rating part
  const ratingCapped = Math.min(ratingScore, 880);

  // Contest participation bonus (0-60): diminishing returns
  const contests = d.contestsAttended ?? 0;
  const contestBonus = Math.min(60 * (1 - Math.exp(-contests / 20)), 60);

  // Problems solved bonus (0-60): diminishing returns
  const solved = d.totalSolved ?? 0;
  const solvedBonus = Math.min(60 * (1 - Math.exp(-solved / 150)), 60);

  return Math.min(Math.round(ratingCapped + contestBonus + solvedBonus), 1000);
}

/**
 * LeetCode score (0-1000).
 *
 * Components:
 *   Problem score (0-550): piecewise on weighted points (easy=1, medium=3, hard=8)
 *     50wp → 80, 150wp → 200, 400wp → 350, 800wp → 450, 1500wp → 520, 3000wp → 550
 *   Contest rating (0-350): piecewise on LC contest rating
 *     1400 → 50, 1600 → 150, 1800 → 250, 2000 → 300, 2400 → 340, 3000 → 350
 *   Consistency (0-100): streak + active days
 */
export function leetcodeScore(d: LeetCodeData): number {
  const easy = d.easySolved ?? 0;
  const medium = d.mediumSolved ?? 0;
  const hard = d.hardSolved ?? 0;
  const total = easy + medium + hard;

  if (total === 0 && !(d.contestRating)) return 0;

  // Weighted problem score (0-550)
  const weightedPts = easy * 1 + medium * 3 + hard * 8;
  const problemScore = piecewise(weightedPts, [
    [0, 0], [50, 80], [150, 200], [400, 350],
    [800, 450], [1500, 520], [3000, 550],
  ]);

  // Contest rating (0-350): LC ratings start at ~1500 for active contestants
  const cr = d.contestRating ?? 0;
  const contestScore = cr > 0
    ? piecewise(cr, [
        [0, 0], [1400, 50], [1600, 150], [1800, 250],
        [2000, 300], [2400, 340], [3000, 350],
      ])
    : 0;

  // Consistency bonus: streak + active days (0-100)
  const streak = d.streak ?? 0;
  const activeDays = d.totalActiveDays ?? 0;
  const consistencyBonus = Math.min(
    Math.min(streak * 1.5, 60) + Math.min(activeDays * 0.15, 40),
    100
  );

  return Math.min(Math.round(problemScore + contestScore + consistencyBonus), 1000);
}

/**
 * CodeChef score (0-1000).
 *
 * Components:
 *   Rating (0-800): piecewise on CC rating (similar rank structure to CF)
 *     1000 → 80, 1200 → 180, 1400 → 300, 1600 → 420,
 *     1800 → 550, 2000 → 660, 2200 → 740, 2500 → 800
 *   Stars bonus (0-100): 1★=15, 2★=30, ... 7★=100
 *   Problems solved (0-100): diminishing returns curve
 */
export function codechefScore(d: CodeChefData): number {
  const rating = Math.max(d.rating ?? 0, d.maxRating ?? 0);
  if (rating <= 0 && (d.problemsSolved ?? 0) === 0) return 0;

  // Rating component (0-800) via piecewise
  const ratingScore = rating > 0
    ? piecewise(rating, [
        [0, 0], [1000, 80], [1200, 180], [1400, 300],
        [1600, 420], [1800, 550], [2000, 660], [2200, 740],
        [2500, 800],
      ])
    : 0;

  // Stars bonus (0-100)
  const starsBonus = Math.min((d.stars ?? 0) * 15, 100);

  // Problems solved (0-100): diminishing returns
  const solved = d.problemsSolved ?? 0;
  const solvedBonus = Math.min(100 * (1 - Math.exp(-solved / 100)), 100);

  return Math.min(Math.round(ratingScore + starsBonus + solvedBonus), 1000);
}

// ─── Aggregated CPulse Score ───────────────────────────────────────

export interface PlatformProfile {
  platform: "codeforces" | "leetcode" | "codechef";
  data: CodeforcesData | LeetCodeData | CodeChefData;
  updatedAt?: Date | string;
}

export interface CPulseResult {
  score: number;           // 0-1050 (1000 + bonuses)
  tier: string;            // e.g. "Gold III"
  title: string;           // e.g. "Algorithm Specialist"
  nextTier: string | null;
  pointsToNextTier: number;
  platformScores: Record<string, number>;
  rewards: Reward[];
  activityBonus: number;
  diversityBonus: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;       // emoji
  earned: boolean;
  category: "problems" | "rating" | "consistency" | "diversity" | "milestone";
}

// ─── Tier System ───────────────────────────────────────────────────

const TIERS = [
  { min: 0,   name: "Bronze III",    title: "Beginner Coder" },
  { min: 100, name: "Bronze II",     title: "Code Learner" },
  { min: 200, name: "Bronze I",      title: "Problem Solver" },
  { min: 300, name: "Silver III",    title: "Rising Coder" },
  { min: 400, name: "Silver II",     title: "Skilled Programmer" },
  { min: 500, name: "Silver I",      title: "Algorithm Enthusiast" },
  { min: 600, name: "Gold III",      title: "Algorithm Specialist" },
  { min: 700, name: "Gold II",       title: "Competitive Expert" },
  { min: 800, name: "Gold I",        title: "Elite Competitor" },
  { min: 900, name: "Platinum",      title: "Master Programmer" },
  { min: 1000, name: "Diamond",      title: "Legendary Coder" },
];

function getTier(score: number): { tier: string; title: string; nextTier: string | null; pointsToNext: number } {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (score >= t.min) current = t;
    else break;
  }

  const idx = TIERS.indexOf(current);
  const next = idx < TIERS.length - 1 ? TIERS[idx + 1] : null;

  return {
    tier: current.name,
    title: current.title,
    nextTier: next?.name ?? null,
    pointsToNext: next ? next.min - score : 0,
  };
}

// ─── Reward Definitions ────────────────────────────────────────────

function evaluateRewards(
  platformScores: Record<string, number>,
  profiles: PlatformProfile[],
  totalScore: number
): Reward[] {
  const rewards: Reward[] = [];

  // Helper to get platform-specific data
  const lc = profiles.find(p => p.platform === "leetcode")?.data as LeetCodeData | undefined;
  const cf = profiles.find(p => p.platform === "codeforces")?.data as CodeforcesData | undefined;
  const cc = profiles.find(p => p.platform === "codechef")?.data as CodeChefData | undefined;

  const totalSolved = (lc?.totalSolved ?? ((lc?.easySolved ?? 0) + (lc?.mediumSolved ?? 0) + (lc?.hardSolved ?? 0)))
    + (cf?.totalSolved ?? 0)
    + (cc?.problemsSolved ?? 0);

  const hardSolved = lc?.hardSolved ?? 0;
  const maxRating = Math.max(cf?.rating ?? 0, cf?.maxRating ?? 0, cc?.rating ?? 0, cc?.maxRating ?? 0, lc?.contestRating ?? 0);

  // ─── Problem Milestones ───
  rewards.push({
    id: "first_50", name: "First Steps", description: "Solve 50 problems across all platforms",
    icon: "🎯", earned: totalSolved >= 50, category: "problems",
  });
  rewards.push({
    id: "centurion", name: "Centurion", description: "Solve 100 problems across all platforms",
    icon: "💯", earned: totalSolved >= 100, category: "problems",
  });
  rewards.push({
    id: "grinder_250", name: "Grinder", description: "Solve 250 problems across all platforms",
    icon: "⚡", earned: totalSolved >= 250, category: "problems",
  });
  rewards.push({
    id: "problem_beast", name: "Problem Beast", description: "Solve 500 problems across all platforms",
    icon: "🔥", earned: totalSolved >= 500, category: "problems",
  });
  rewards.push({
    id: "thousand_club", name: "1K Club", description: "Solve 1000 problems across all platforms",
    icon: "👑", earned: totalSolved >= 1000, category: "problems",
  });

  // ─── Hard Problem Rewards ───
  rewards.push({
    id: "hard_starter", name: "Hard Starter", description: "Solve 10 hard problems on LeetCode",
    icon: "💎", earned: hardSolved >= 10, category: "problems",
  });
  rewards.push({
    id: "hard_grinder", name: "Hard Grinder", description: "Solve 50 hard problems on LeetCode",
    icon: "🏔️", earned: hardSolved >= 50, category: "problems",
  });

  // ─── Rating Milestones ───
  rewards.push({
    id: "rated_1200", name: "Rated Warrior", description: "Reach 1200+ rating on any platform",
    icon: "⚔️", earned: maxRating >= 1200, category: "rating",
  });
  rewards.push({
    id: "rated_1600", name: "Expert Rising", description: "Reach 1600+ rating on any platform",
    icon: "🌟", earned: maxRating >= 1600, category: "rating",
  });
  rewards.push({
    id: "rated_2000", name: "Master Tier", description: "Reach 2000+ rating on any platform",
    icon: "🏆", earned: maxRating >= 2000, category: "rating",
  });
  rewards.push({
    id: "rated_2400", name: "Grandmaster", description: "Reach 2400+ rating on any platform",
    icon: "👑", earned: maxRating >= 2400, category: "rating",
  });

  // ─── Consistency ───
  const streak = lc?.streak ?? 0;
  rewards.push({
    id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day coding streak",
    icon: "🔥", earned: streak >= 7, category: "consistency",
  });
  rewards.push({
    id: "streak_30", name: "Monthly Machine", description: "Maintain a 30-day coding streak",
    icon: "🗓️", earned: streak >= 30, category: "consistency",
  });
  rewards.push({
    id: "streak_100", name: "Consistency King", description: "Maintain a 100-day coding streak",
    icon: "💪", earned: streak >= 100, category: "consistency",
  });

  // ─── Diversity ───
  const platformCount = profiles.length;
  rewards.push({
    id: "multi_platform", name: "Multi-Platform", description: "Link 2+ competitive programming platforms",
    icon: "🌐", earned: platformCount >= 2, category: "diversity",
  });
  rewards.push({
    id: "triple_threat", name: "Triple Threat", description: "Link all 3 platforms (CF + LC + CC)",
    icon: "🔱", earned: platformCount >= 3, category: "diversity",
  });

  // ─── CPulse Score Milestones ───
  rewards.push({
    id: "cpulse_300", name: "Silver Pulse", description: "Reach CPulse Score 300",
    icon: "🥈", earned: totalScore >= 300, category: "milestone",
  });
  rewards.push({
    id: "cpulse_500", name: "Gold Pulse", description: "Reach CPulse Score 500",
    icon: "🥇", earned: totalScore >= 500, category: "milestone",
  });
  rewards.push({
    id: "cpulse_700", name: "Platinum Pulse", description: "Reach CPulse Score 700",
    icon: "💎", earned: totalScore >= 700, category: "milestone",
  });
  rewards.push({
    id: "cpulse_900", name: "Diamond Pulse", description: "Reach CPulse Score 900",
    icon: "✨", earned: totalScore >= 900, category: "milestone",
  });

  return rewards;
}

// ─── Main aggregated calculation ──────────────────────────────────

export function calculateCPulseScore(profiles: PlatformProfile[]): CPulseResult {
  if (profiles.length === 0) {
    const tierInfo = getTier(0);
    return {
      score: 0,
      tier: tierInfo.tier,
      title: tierInfo.title,
      nextTier: tierInfo.nextTier,
      pointsToNextTier: tierInfo.pointsToNext,
      platformScores: {},
      rewards: evaluateRewards({}, [], 0),
      activityBonus: 0,
      diversityBonus: 0,
    };
  }

  // Calculate per-platform scores
  const platformScores: Record<string, number> = {};
  for (const p of profiles) {
    switch (p.platform) {
      case "codeforces":
        platformScores.codeforces = codeforcesScore(p.data as CodeforcesData);
        break;
      case "leetcode":
        platformScores.leetcode = leetcodeScore(p.data as LeetCodeData);
        break;
      case "codechef":
        platformScores.codechef = codechefScore(p.data as CodeChefData);
        break;
    }
  }

  // Weighted average of all platform scores (fair for any count)
  const scores = Object.values(platformScores);
  const baseScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Activity bonus: +25 if any profile updated within 7 days
  let activityBonus = 0;
  for (const p of profiles) {
    if (p.updatedAt) {
      const daysSince = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) { activityBonus = 25; break; }
      if (daysSince <= 30 && activityBonus < 10) activityBonus = 10;
    }
  }

  // Diversity bonus: +25 if 2+ platforms, encourages linking more
  const diversityBonus = profiles.length >= 3 ? 25 : profiles.length >= 2 ? 15 : 0;

  const totalScore = Math.min(baseScore + activityBonus + diversityBonus, 1050);

  const tierInfo = getTier(totalScore);

  return {
    score: totalScore,
    tier: tierInfo.tier,
    title: tierInfo.title,
    nextTier: tierInfo.nextTier,
    pointsToNextTier: tierInfo.pointsToNext,
    platformScores,
    rewards: evaluateRewards(platformScores, profiles, totalScore),
    activityBonus,
    diversityBonus,
  };
}

// ─── Legacy single-platform calculation (for backward compat) ─────

export function calculateCPulseRating(user: {
  platform?: string;
  rating?: number;
  maxRating?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  totalSolved?: number;
  stars?: number;
  problemsSolved?: number;
  contestRating?: number;
  contestsAttended?: number;
  streak?: number;
  totalActiveDays?: number;
  updatedAt?: Date;
}): number {
  const platform = user.platform ?? "leetcode";

  let score = 0;
  switch (platform) {
    case "codeforces":
      score = codeforcesScore(user as CodeforcesData);
      break;
    case "leetcode":
      score = leetcodeScore(user as LeetCodeData);
      break;
    case "codechef":
      score = codechefScore(user as CodeChefData);
      break;
  }

  return score;
}
