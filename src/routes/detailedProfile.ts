/**
 * ENHANCED USER PROFILE ROUTE
 * Provides detailed data from all platforms using improved web scraping
 */

import express from "express";
import * as enhancedScraping from "../services/enhancedScraping";

const router = express.Router();

// ==================== DETAILED PROFILE ENDPOINTS ====================

/**
 * GET /api/detailed/codeforces/:handle
 * Returns comprehensive Codeforces data including:
 * - Rating history with contest details
 * - Problem difficulty breakdown
 * - Submission statistics
 * - Friend data
 */
router.get("/detailed/codeforces/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const data = await enhancedScraping.getCodeForcesEnhanced(handle);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/detailed/codechef/:username
 * Returns comprehensive CodeChef data including:
 * - Division and stars
 * - Problem difficulty breakdown
 * - Global and country ranking
 * - Country information
 */
router.get("/detailed/codechef/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const data = await enhancedScraping.getCodeChefEnhanced(username);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/detailed/leetcode/:username
 * Returns comprehensive LeetCode data including:
 * - Problem difficulty breakdown with acceptance rates
 * - Contest participation history
 * - Profile information (company, school, skills)
 * - Real-time profile stats
 */
router.get("/detailed/leetcode/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const data = await enhancedScraping.getLeetCodeEnhanced(username);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/detailed/:platform/:username
 * Universal endpoint for any platform
 * Query params: platform=codeforces|codechef|leetcode
 */
router.get("/detailed/:platform/:username", async (req, res) => {
  try {
    const { platform, username } = req.params;

    if (!["codeforces", "codechef", "leetcode"].includes(platform)) {
      return res.status(400).json({
        error: "Invalid platform. Use: codeforces, codechef, or leetcode",
      });
    }

    const data = await enhancedScraping.getDetailedProfile(
      username,
      platform as "codeforces" | "codechef" | "leetcode"
    );

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/detailed/compare/:platform1/:user1/:platform2/:user2
 * Compare two users from different platforms
 */
router.get(
  "/detailed/compare/:platform1/:user1/:platform2/:user2",
  async (req, res) => {
    try {
      const { platform1, user1, platform2, user2 } = req.params;

      const [profile1, profile2] = await Promise.all([
        enhancedScraping.getDetailedProfile(
          user1,
          platform1 as "codeforces" | "codechef" | "leetcode"
        ),
        enhancedScraping.getDetailedProfile(
          user2,
          platform2 as "codeforces" | "codechef" | "leetcode"
        ),
      ]);

      const getRating = (p: any) => p.rating || p.contestRating || 0;
      const getSolved = (p: any) => p.totalSolved || p.problemsSolved || 0;
      const getRank = (p: any) => p.globalRank || p.globalRanking || 0;

      res.json({
        user1: profile1,
        user2: profile2,
        comparison: {
          ratingDifference: Math.abs(getRating(profile1) - getRating(profile2)),
          globalRankingDifference: Math.abs(getRank(profile1) - getRank(profile2)),
          problemsSolvedDifference: Math.abs(getSolved(profile1) - getSolved(profile2)),
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
