import axios from "axios";
import * as cheerio from "cheerio";

/**
 * ENHANCED WEB SCRAPING SERVICE
 * Extracts detailed information from competitive programming platforms
 * with better parsing, error handling, and data enrichment
 */

// ==================== CODEFORCES ENHANCED ====================
export async function getCodeForcesEnhanced(handle: string) {
  try {
    // 1️⃣ Fetch basic user info
    const infoRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      { timeout: 10000 }
    );

    if (!infoRes.data.result || infoRes.data.result.length === 0) {
      throw new Error("User not found");
    }

    const user = infoRes.data.result[0];

    // 2️⃣ Fetch rating history
    const ratingRes = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
      { timeout: 10000 }
    );

    const history = ratingRes.data.result.map((item: any) => ({
      date: new Date(item.ratingUpdateTimeSeconds * 1000)
        .toISOString()
        .split("T")[0],
      score: item.newRating,
      contestId: item.contestId,
      contestName: item.contestName,
      rank: item.place,
      oldRating: item.oldRating,
      newRating: item.newRating,
      ratingChange: item.newRating - item.oldRating,
    }));

    // 3️⃣ Fetch submissions (for problem count & difficulty breakdown)
    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=100000`,
      { timeout: 15000 }
    );

    const submissions = submissionsRes.data.result || [];

    // Count AC (accepted) problems by difficulty
    const solvedProblems = new Set<string>();
    const difficultyBreakdown: Record<number, number> = {};
    let totalSubmissions = submissions.length;
    let acceptedSubmissions = 0;

    let lastAcceptedTime: string | null = null;
    let solvedRatingTotal = 0;
    let solvedRatingCount = 0;

    const verdictBreakdown: Record<string, number> = {};
    const languageBreakdown: Record<string, number> = {};
    const tagBreakdown: Record<string, number> = {};

    submissions.forEach((sub: any) => {
      // Verdict counts (all submissions)
      if (sub.verdict) {
        verdictBreakdown[sub.verdict] = (verdictBreakdown[sub.verdict] || 0) + 1;
      }

      // Language counts (all submissions)
      if (sub.programmingLanguage) {
        languageBreakdown[sub.programmingLanguage] =
          (languageBreakdown[sub.programmingLanguage] || 0) + 1;
      }

      if (sub.verdict === "OK") {
        acceptedSubmissions++;
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        solvedProblems.add(problemId);

        const difficulty = sub.problem.rating || 0;
        difficultyBreakdown[difficulty] =
          (difficultyBreakdown[difficulty] || 0) + 1;

        // Track last AC time
        const ts = sub.creationTimeSeconds
          ? new Date(sub.creationTimeSeconds * 1000).toISOString()
          : null;
        if (ts) {
          if (!lastAcceptedTime || ts > lastAcceptedTime) {
            lastAcceptedTime = ts;
          }
        }

        // Average solved difficulty
        if (difficulty) {
          solvedRatingTotal += difficulty;
          solvedRatingCount += 1;
        }

        // Tag breakdown (accepted problems only)
        if (Array.isArray(sub.problem.tags)) {
          sub.problem.tags.forEach((tag: string) => {
            tagBreakdown[tag] = (tagBreakdown[tag] || 0) + 1;
          });
        }
      }
    });

    // 4️⃣ Fetch user friends
    let friendCount = 0;
    try {
      const friendRes = await axios.get(
        `https://codeforces.com/api/user.friends?onlyOnline=false`,
        { timeout: 5000 }
      );
      friendCount = friendRes.data.result?.length || 0;
    } catch {
      friendCount = user.friendOfCount || 0;
    }

    return {
      handle: user.handle,
      platform: "codeforces",

      // Basic Metrics
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "Unrated",
      maxRank: user.maxRank || "Unrated",

      // Enhanced Metrics
      totalProblems: solvedProblems.size,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: totalSubmissions > 0
        ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)
        : "0",

      // Difficulty Breakdown
      difficultyBreakdown: {
        veryEasy: difficultyBreakdown[800] || 0,
        easy: difficultyBreakdown[1200] || 0,
        medium: difficultyBreakdown[1600] || 0,
        hard: difficultyBreakdown[2000] || 0,
        veryHard: difficultyBreakdown[2400] || 0,
      },

      // Social Metrics
      contribution: user.contribution || 0,
      friendOfCount: user.friendOfCount || 0,
      friends: friendCount,

      // Activity Breakdown
      verdictBreakdown,
      languageBreakdown,
      tagBreakdown,
      lastAcceptedTime,
      averageSolvedDifficulty:
        solvedRatingCount > 0
          ? Math.round(solvedRatingTotal / solvedRatingCount)
          : 0,

      // Rich Data
      avatar: user.titlePhoto || "",
      title: user.rank || "Unrated",
      organization: user.organization || "Independent",
      lastOnlineTime: new Date(
        user.lastOnlineTimeSeconds * 1000
      ).toISOString(),

      // Historical Data
      recentContests: history.slice(0, 10),
      contestHistory: history,
      ratingTrend: history.length > 0 ? history[history.length - 1].newRating - history[0].newRating : 0,
    };
  } catch (err: any) {
    console.error("CODEFORCES ENHANCED ERROR:", err.message);
    throw new Error(err.message || "Failed to fetch Codeforces data");
  }
}

// ==================== CODECHEF ENHANCED ====================
export async function getCodeChefEnhanced(username: string) {
  try {
    const response = await axios.get(
      `https://www.codechef.com/users/${username}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.5",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(response.data);
    const pageText = $("body").text();

    // Validate user exists
    if (pageText.includes("Page Not Found") || pageText.includes("404")) {
      throw new Error("CodeChef user not found");
    }

    // Extract all metrics
    const ratingMatch = pageText.match(/Rating[\s:]+(\d{3,4})/i);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;

    const maxRatingMatch = pageText.match(/Highest[\s:]+(\d{3,4})/i);
    const maxRating = maxRatingMatch ? parseInt(maxRatingMatch[1]) : rating;

    const problemsMatch = pageText.match(
      /Total\s+Problems\s+Solved[\s:]+(\d+)/i
    );
    const problemsSolved = problemsMatch ? parseInt(problemsMatch[1]) : 0;

    const globalRankMatch = pageText.match(/Global\s+Rank[\s:]+(\d+)/i);
    const globalRank = globalRankMatch ? parseInt(globalRankMatch[1]) : 0;

    const countryRankMatch = pageText.match(/Country\s+Rank[\s:]+(\d+)/i);
    const countryRank = countryRankMatch ? parseInt(countryRankMatch[1]) : 0;

    // Extract stars
    let stars = 0;
    const starMatch = pageText.match(/(\d)\s*[★⭐]/i) || pageText.match(/(\d)\s*Star/i);
    if (starMatch) stars = parseInt(starMatch[1]);

    // Extract division
    const divMatch = pageText.match(/Division[\s:]+(\d)/i);
    const division = divMatch ? `Div ${divMatch[1]}` : "Div ?";

    // Extract country
    const countryMatch = pageText.match(/Country[\s:]+([^,\n]+)/i);
    const country = countryMatch ? countryMatch[1].trim() : "Unknown";

    // Extract institution/school (best-effort)
    let institution = "";
    const institutionMatch = pageText.match(/Institution[\s:]+([^\n]+)/i);
    if (institutionMatch) {
      institution = institutionMatch[1].trim();
    }

    // Extract bio / about (best-effort)
    let about = "";
    const aboutMatch = pageText.match(/About\s*Me[\s:]*([^\n]+)/i);
    if (aboutMatch) {
      about = aboutMatch[1].trim();
    }

    // Extract problem difficulty breakdown (if available in page)
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const easyMatch = pageText.match(
      /Easy[\s:]+(\d+)/i
    );
    if (easyMatch) easyCount = parseInt(easyMatch[1]);

    const mediumMatch = pageText.match(/Medium[\s:]+(\d+)/i);
    if (mediumMatch) mediumCount = parseInt(mediumMatch[1]);

    const hardMatch = pageText.match(/Hard[\s:]+(\d+)/i);
    if (hardMatch) hardCount = parseInt(hardMatch[1]);

    // Extract avatar
    const avatarUrl = $(".user-details-container img, .user-avatar img").attr(
      "src"
    );

    // Extract badges (collect alt text or title)
    const badges: string[] = [];
    $(".user-badges img, img[alt*='badge'], img[title*='badge']").each((_, el) => {
      const alt = ($(el).attr("alt") || $(el).attr("title") || "").trim();
      if (alt && !badges.includes(alt)) {
        badges.push(alt);
      }
    });

    return {
      handle: username,
      platform: "codechef",

      // Basic Metrics
      rating,
      maxRating,
      stars,
      globalRank,
      countryRank,
      problemsSolved,

      // Enhanced Metrics
      division,
      country,

      // Difficulty Breakdown
      difficultyBreakdown: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },

      // Rich Data
      avatar: avatarUrl || "",
      title: `${stars}* ${division}`,
      ratingTrend: rating - (maxRating > rating ? maxRating : rating),
      institution,
      about,
      badges,

      // Additional Info
      estimatedProblems: problemsSolved, // Total problems attempted/solved
    };
  } catch (err: any) {
    console.error("CODECHEF ENHANCED ERROR:", err.message);
    throw new Error(err.message || "Failed to fetch CodeChef data");
  }
}

// ==================== LEETCODE ENHANCED ====================
export async function getLeetCodeEnhanced(username: string) {
  try {
    const query = {
      query: `
        query {
          matchedUser(username: "${username}") {
            username
            profile {
              ranking
              userAvatar
              reputation
              realName
              countryName
              company
              school
              websites
              skillTags
              aboutMe
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
              totalSubmissionNum {
                difficulty
                count
              }
            }
            problems {
              solved
            }
          }
          userContestRanking(username: "${username}") {
            rating
            globalRanking
            topPercentage
            atRating
            contests {
              title
              rank
              rating
              problemsSolved
              totalProblems
              finishTime
              rating
            }
          }
          recentAcSubmissionList(username: "${username}", limit: 10) {
            id
            title
            titleSlug
            timestamp
          }
          userProfileCalendar(username: "${username}") {
            submissionCalendar
          }
        }
      `,
    };

    const response = await axios.post(
      "https://leetcode.com/graphql",
      query,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 10000,
      }
    );

    const user = response.data?.data?.matchedUser;
    const contest = response.data?.data?.userContestRanking;
    const recentAccepted = response.data?.data?.recentAcSubmissionList || [];
    const calendarData = response.data?.data?.userProfileCalendar?.submissionCalendar;

    if (!user) {
      throw new Error("LeetCode user not found");
    }

    // Parse submission stats
    const acBreakdown = user.submitStats.acSubmissionNum.reduce(
      (acc: any, item: any) => {
        acc[item.difficulty.toLowerCase()] = item.count;
        return acc;
      },
      {}
    );

    const totalBreakdown = user.submitStats.totalSubmissionNum.reduce(
      (acc: any, item: any) => {
        acc[item.difficulty.toLowerCase()] = item.count;
        return acc;
      },
      {}
    );

    const totalSolved =
      (acBreakdown.easy || 0) +
      (acBreakdown.medium || 0) +
      (acBreakdown.hard || 0);

    const totalProblems =
      (totalBreakdown.easy || 0) +
      (totalBreakdown.medium || 0) +
      (totalBreakdown.hard || 0);

    // Calculate current activity streak from submission calendar
    let currentStreak = 0;
    try {
      if (calendarData) {
        const calendarJson = JSON.parse(calendarData);
        const today = new Date();
        // normalize to UTC midnight
        today.setUTCHours(0, 0, 0, 0);

        let cursor = new Date(today);
        while (true) {
          const tsSeconds = Math.floor(cursor.getTime() / 1000);
          const hasSubmission = calendarJson[tsSeconds] && calendarJson[tsSeconds] > 0;
          if (hasSubmission) {
            currentStreak++;
            cursor.setUTCDate(cursor.getUTCDate() - 1);
          } else {
            break;
          }
        }
      }
    } catch {
      currentStreak = 0;
    }

    return {
      handle: user.username,
      platform: "leetcode",

      // Basic Metrics
      totalSolved,
      easySolved: acBreakdown.easy || 0,
      mediumSolved: acBreakdown.medium || 0,
      hardSolved: acBreakdown.hard || 0,

      // Enhanced Metrics
      totalProblems,
      easyAttempts: totalBreakdown.easy || 0,
      mediumAttempts: totalBreakdown.medium || 0,
      hardAttempts: totalBreakdown.hard || 0,

      acceptanceRate: {
        easy:
          totalBreakdown.easy > 0
            ? (((acBreakdown.easy || 0) / totalBreakdown.easy) * 100).toFixed(
              2
            )
            : "0",
        medium:
          totalBreakdown.medium > 0
            ? (((acBreakdown.medium || 0) / totalBreakdown.medium) * 100).toFixed(
              2
            )
            : "0",
        hard:
          totalBreakdown.hard > 0
            ? (((acBreakdown.hard || 0) / totalBreakdown.hard) * 100).toFixed(
              2
            )
            : "0",
      },
      acceptanceRateOverall:
        totalProblems > 0
          ? ((totalSolved / totalProblems) * 100).toFixed(2)
          : "0",

      // Contest Data
      contestRating: Math.round(contest?.rating || 0),
      globalRanking: contest?.globalRanking || user.profile.ranking,
      topPercentage: (contest?.topPercentage || 0).toFixed(2),
      recentContests: contest?.contests || [],
      contestCount: contest?.contests?.length || 0,

      // Profile Info
      avatar: user.profile.userAvatar || "",
      realName: user.profile.realName || "",
      reputation: user.profile.reputation || 0,
      countryName: user.profile.countryName || "Unknown",
      company: user.profile.company || "Not specified",
      school: user.profile.school || "Not specified",
      skillTags: user.profile.skillTags || [],
      aboutMe: user.profile.aboutMe || "",
      recentAccepted: recentAccepted.map((item: any) => ({
        id: item.id,
        title: item.title,
        titleSlug: item.titleSlug,
        timestamp: item.timestamp ? new Date(Number(item.timestamp) * 1000).toISOString() : "",
      })),
      activityStreak: currentStreak,

      // Rich Data
      title: contest?.rating
        ? contest.rating > 2400
          ? "Legendary"
          : contest.rating > 2000
            ? "Guardian"
            : contest.rating > 1600
              ? "Knight"
              : "Member"
        : "Member",

      ratingTrend: contest?.rating || 0,
    };
  } catch (err: any) {
    console.error("LEETCODE ENHANCED ERROR:", err.message);
    throw new Error(err.message || "Failed to fetch LeetCode data");
  }
}

// ==================== UNIFIED DETAILED PROFILE ====================
export async function getDetailedProfile(
  username: string,
  platform: "codeforces" | "codechef" | "leetcode"
) {
  try {
    switch (platform) {
      case "codeforces":
        return await getCodeForcesEnhanced(username);
      case "codechef":
        return await getCodeChefEnhanced(username);
      case "leetcode":
        return await getLeetCodeEnhanced(username);
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  } catch (err: any) {
    throw new Error(
      `Failed to fetch ${platform} profile: ${err.message}`
    );
  }
}
