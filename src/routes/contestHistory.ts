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
 * Fetch CodeChef contest/rating history by scraping the profile page.
 * The old third-party API (codechef-api.vercel.app) is dead (402).
 * CodeChef embeds all rating data in a `var all_rating = [...]` JS variable
 * on the profile page at https://www.codechef.com/users/:handle.
 */
router.get("/codechef/:handle", async (req, res) => {
  try {
    const handle = req.params.handle.trim();

    const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          return await axios.get(url, {
            timeout: 15000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });
        } catch (err: any) {
          if (err.response?.status === 429 && i < retries - 1) {
            await new Promise(r => setTimeout(r, (i + 1) * 2000));
            continue;
          }
          throw err;
        }
      }
      throw new Error("Max retries exceeded");
    };

      const response = await fetchWithRetry(
        `https://www.codechef.com/users/${encodeURIComponent(handle)}`
      );

      const html: string = response!.data;

    // Extract rating history from embedded JS variable
    const ratingMatch = html.match(/var\s+all_rating\s*=\s*(\[.*?\]);/s);
    if (!ratingMatch) {
      return res
        .status(404)
        .json({ success: false, error: "User not found or no contest history" });
    }

    const allRating: any[] = JSON.parse(ratingMatch[1]);

    // Extract display name
    const nameMatch = html.match(/<h1[^>]*class="h2-style"[^>]*>([^<]+)/);
    const displayName = nameMatch ? nameMatch[1].trim() : handle;

    // Extract star rating from rating-star div
    const starsMatch = html.match(
      /class="rating-star">([\s\S]*?)<\/div>/
    );
    let stars = 0;
    if (starsMatch) {
      stars = (starsMatch[1].match(/&#9733;/g) || []).length;
    }

    // Extract star color (indicates tier)
    const starColorMatch = html.match(
      /class="rating-star">.*?background-color:\s*(#[A-Fa-f0-9]+)/s
    );
    const starColor = starColorMatch ? starColorMatch[1] : null;

    // Build contest list
    const contests = allRating.map((entry: any) => ({
      contestId: entry.code || "",
      contestName: entry.name || entry.code || "Unknown",
      platform: "codechef",
      rank: parseInt(entry.rank, 10) || 0,
      oldRating: 0,
      newRating: parseInt(entry.rating, 10) || 0,
      ratingChange: 0,
      color: entry.color || null,
      date: entry.end_date
        ? new Date(entry.end_date).toISOString()
        : new Date(
            `${entry.getyear}-${String(entry.getmonth).padStart(2, "0")}-${String(entry.getday).padStart(2, "0")}`
          ).toISOString(),
    }));

    // Calculate rating changes between consecutive contests
    for (let i = 1; i < contests.length; i++) {
      contests[i].oldRating = contests[i - 1].newRating;
      contests[i].ratingChange = contests[i].newRating - contests[i].oldRating;
    }

    const currentRating =
      contests.length > 0 ? contests[contests.length - 1].newRating : 0;
    const highestRating = Math.max(...contests.map((c: any) => c.newRating), 0);

    res.json({
      success: true,
      platform: "codechef",
      handle,
      profile: {
        displayName,
        currentRating,
        highestRating,
        stars,
        starColor,
      },
      contests,
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return res
        .status(404)
        .json({ success: false, error: "CodeChef user not found" });
    }
    if (error.response?.status === 429) {
      return res
        .status(429)
        .json({ success: false, error: "CodeChef rate limit - please try again later" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
