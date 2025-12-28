import express from "express";
import cors from "cors";
import axios from "axios"; // ✅ REQUIRED

import { connectDB } from "./db/mongo";
import { User } from "./models/User";

import { getUserInfo } from "./services/codeforces";
import { getLeetCodeUser } from "./services/leetcode";

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================== MIDDLEWARE ===================== */
app.use(cors());
app.use(express.json());

/* ===================== HEALTH CHECK ===================== */
app.get("/", (_req, res) => {
  res.send("CPulse backend is running 🚀");
});

/* ======================================================
   USER GROWTH (CORE ENDPOINT)
   ====================================================== */
app.get("/user/:platform/:username/history", async (req, res) => {
  const { platform, username } = req.params;

  try {
    let user;

    const existing = await User.findOne({
      handle: username,
      platform,
    });

    if (existing?.history?.length) {
      return res.json({
        platform: existing.platform,
        handle: existing.handle,
        rating: existing.rating,
        maxRating: existing.maxRating,
        rank: existing.rank,
        maxRank: existing.maxRank,
        totalSolved: existing.totalSolved,
        history: existing.history || [],
      });
    }

    let normalizedData;

    if (platform === "codeforces") {
      normalizedData = await getUserInfo(username);
    } else if (platform === "leetcode") {
      normalizedData = await getLeetCodeUser(username);
    } else {
      return res.status(400).json({ error: "Unsupported platform" });
    }

    user = await User.findOneAndUpdate(
      { handle: normalizedData.handle, platform },
      { ...normalizedData, platform },
      { upsert: true, new: true }
    );

    return res.json({
      platform: user.platform,
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank,
      totalSolved: user.totalSolved,
      history: user.history || [],
    });
  } catch (error: any) {
    console.error("USER HISTORY ERROR:", error.message);
    return res.status(500).json({
      error: "Failed to fetch user data",
    });
  }
});


/* ===================== LEADERBOARD ===================== */
app.get("/leaderboard", async (_req, res) => {
  try {
    const users = await User.find({ platform: "codeforces" })
      .sort({ rating: -1 })
      .limit(50)
      .select("-__v");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch leaderboard",
    });
  }
});

/* ===================== COMBINED LEADERBOARD ===================== */
app.get("/leaderboard/combined", async (_req, res) => {
  try {
    const cfUsers = await User.find({ platform: "codeforces" })
      .sort({ rating: -1 })
      .limit(50);

    const lcUsers = await User.find({ platform: "leetcode" })
      .sort({ totalSolved: -1 })
      .limit(50);

    res.json([...cfUsers, ...lcUsers]);
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

/* ===================== CLASS LEADERBOARD ===================== */
app.get("/leaderboard/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params;

    const users = await User.find({ classId })
      .sort({ rating: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch class leaderboard",
    });
  }
});

/* ===================== DB + SERVER ===================== */
connectDB();

app.listen(PORT, () => {
  console.log(`CPulse backend running on port ${PORT}`);
});
