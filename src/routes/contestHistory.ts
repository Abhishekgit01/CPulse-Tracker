import { Router } from "express";
import axios from "axios";

const router = Router();

/**
 * GET /api/contest-history/codeforces/:handle
 * Fetch Codeforces rating/contest history
 */
router.get("/codeforces/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const response = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`
    );

    const contests = response.data.result.map((entry: any) => ({
      contestId: String(entry.contestId),
      contestName: entry.contestName,
      platform: "codeforces",
      rank: entry.rank,
      oldRating: entry.oldRating,
      newRating: entry.newRating,
      ratingChange: entry.newRating - entry.oldRating,
      date: new Date(entry.ratingUpdateTimeSeconds * 1000).toISOString(),
    }));

    res.json({ success: true, platform: "codeforces", handle, contests });
  } catch (error: any) {
    const msg = error.response?.data?.comment || error.message;
    res.status(400).json({ success: false, error: msg });
  }
});

/**
 * GET /api/contest-history/leetcode/:handle
 * Fetch LeetCode contest ranking history
 */
router.get("/leetcode/:handle", async (req, res) => {
  try {
    const { handle } = req.params;

    const query = {
      query: `
        query userContestRankingInfo($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            contest {
              title
              startTime
            }
          }
        }
      `,
      variables: { username: handle },
    };

    const response = await axios.post("https://leetcode.com/graphql", query, {
      headers: { "Content-Type": "application/json" },
    });

    const history = response.data.data.userContestRankingHistory || [];
    const ranking = response.data.data.userContestRanking;

    const contests = history
      .filter((entry: any) => entry.attended)
      .map((entry: any) => ({
        contestId: entry.contest.title.replace(/\s+/g, "-").toLowerCase(),
        contestName: entry.contest.title,
        platform: "leetcode",
        rank: entry.ranking,
        oldRating: 0,
        newRating: Math.round(entry.rating),
        ratingChange: 0,
        date: new Date(entry.contest.startTime * 1000).toISOString(),
      }));

    // Calculate rating changes between consecutive contests
    for (let i = 1; i < contests.length; i++) {
      contests[i].oldRating = contests[i - 1].newRating;
      contests[i].ratingChange = contests[i].newRating - contests[i].oldRating;
    }

    res.json({
      success: true,
      platform: "leetcode",
      handle,
      summary: ranking,
      contests,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contest-history/codechef/:handle
 * Fetch CodeChef contest/rating history
 */
router.get("/codechef/:handle", async (req, res) => {
  try {
    const { handle } = req.params;

    const response = await axios.get(
      `https://codechef-api.vercel.app/handle/${handle}`
    );

    const data = response.data;
    const ratingData = data.ratingData || [];

    const contests = ratingData.map((entry: any) => ({
      contestId: entry.code || entry.name?.replace(/\s+/g, "-").toLowerCase() || "",
      contestName: entry.name || entry.code || "Unknown",
      platform: "codechef",
      rank: entry.rank || 0,
      oldRating: 0,
      newRating: entry.rating || 0,
      ratingChange: 0,
      date: entry.end_date || entry.getyear
        ? new Date(entry.end_date || `${entry.getyear}-01-01`).toISOString()
        : new Date().toISOString(),
    }));

    // Calculate rating changes
    for (let i = 1; i < contests.length; i++) {
      contests[i].oldRating = contests[i - 1].newRating;
      contests[i].ratingChange = contests[i].newRating - contests[i].oldRating;
    }

    res.json({ success: true, platform: "codechef", handle, contests });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
