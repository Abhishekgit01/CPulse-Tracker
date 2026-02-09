import axios from "axios";

interface GrowthPoint {
  date: string;
  score: number;
}

export async function getUserInfo(handle: string) {
  // 1. Fetch basic user info
  const infoRes = await axios.get(
    `https://codeforces.com/api/user.info?handles=${handle}`
  );

  const user = infoRes.data.result[0];

  // 2. Fetch rating history
  const ratingRes = await axios.get(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  );

  const history: GrowthPoint[] = ratingRes.data.result.map((item: any) => ({
    date: new Date(item.ratingUpdateTimeSeconds * 1000)
      .toISOString()
      .split("T")[0],
    score: item.newRating,
  }));

  // 3. Fetch recent submissions (last 30)
  let recentSubmissions: any[] = [];
  let totalSolved = 0;
  let languageStats: Record<string, number> = {};
  try {
    const statusRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=100`
    );
    const submissions = statusRes.data.result || [];

    // Count unique solved problems
    const solvedSet = new Set<string>();
    for (const sub of submissions) {
      if (sub.verdict === "OK" && sub.problem) {
        solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
        // Track languages
        const lang = sub.programmingLanguage || "Unknown";
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      }
    }
    totalSolved = solvedSet.size;

    // Get recent 10 submissions
    recentSubmissions = submissions.slice(0, 10).map((s: any) => ({
      title: s.problem ? `${s.problem.contestId}${s.problem.index} - ${s.problem.name}` : "Unknown",
      status: s.verdict || "PENDING",
      language: s.programmingLanguage || "Unknown",
      timestamp: new Date(s.creationTimeSeconds * 1000).toISOString(),
      tags: s.problem?.tags || [],
      rating: s.problem?.rating || 0,
    }));
  } catch {
    // Submissions API may fail, continue with what we have
  }

  // Convert language stats to sorted array
  const languages = Object.entries(languageStats)
    .map(([name, count]) => ({ name, problemsSolved: count }))
    .sort((a, b) => b.problemsSolved - a.problemsSolved)
    .slice(0, 8);

  // Calculate contests attended
  const contestsAttended = ratingRes.data.result.length;

  // 4. Return normalized data
  return {
    handle: user.handle,
    platform: "codeforces" as const,
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || "unrated",
    maxRank: user.maxRank || "unrated",

    // Rich Fields
    avatar: user.titlePhoto,
    title: user.rank || "unrated",
    contribution: user.contribution || 0,
    friendOfCount: user.friendOfCount || 0,
    organization: user.organization || "Independent",
    lastOnlineTimeSeconds: user.lastOnlineTimeSeconds,
    registrationTimeSeconds: user.registrationTimeSeconds,
    city: user.city || "",
    country: user.country || "",

    // New enhanced fields
    totalSolved,
    contestsAttended,
    languages,
    recentSubmissions,

    history,
  };
}
