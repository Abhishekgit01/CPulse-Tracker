import { Router } from "express";
import { User } from "../models/User";
import { calculateCPulseRating } from "../services/cpulseRating";
import { getCodeChefUser } from "../services/codechef";

const router = Router();

/* ===================== GET CODECHEF USER ===================== */
router.get("/codechef/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // 1️⃣ Check DB for cached data
    const existing = await User.findOne({
      handle: username,
      platform: "codechef",
    });

    if (existing) {
      return res.json({
        handle: existing.handle,
        platform: "codechef",
        rating: existing.rating || 0,
        maxRating: existing.maxRating || 0,
        stars: existing.stars || 0,
        globalRank: existing.globalRank || 0,
        countryRank: existing.countryRank || 0,
        problemsSolved: existing.problemsSolved || 0,
        history: existing.history || [],
      });
    }

    // 2️⃣ Fetch from CodeChef
    const normalizedData = await getCodeChefUser(username);

    // 3️⃣ Save to DB
    const user = await User.findOneAndUpdate(
      { handle: username, platform: "codechef" },
      { ...normalizedData, platform: "codechef" },
      { upsert: true, new: true }
    );

    if (!user) {
      return res.status(500).json({ error: "Failed to save user data" });
    }

    // 4️⃣ Calculate CPulse rating
    user.cpulseRating = calculateCPulseRating(user);
    await user.save();

    return res.json({
      handle: user.handle,
      platform: "codechef",
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      stars: user.stars || 0,
      globalRank: user.globalRank || 0,
      countryRank: user.countryRank || 0,
      problemsSolved: user.problemsSolved || 0,
      history: user.history || [],
    });
  } catch (error: any) {
    console.error("CODECHEF USER ERROR:", error.message);
    return res.status(500).json({
      error: error.message || "Failed to fetch CodeChef user data",
    });
  }
});

export default router;
