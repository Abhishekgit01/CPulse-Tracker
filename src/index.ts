import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { connectDB } from "./db/mongo";
import { User } from "./models/User";
import { calculateCPulseRating } from "./services/cpulseRating";

import { getUserInfo } from "./services/codeforces";
import { getLeetCodeUser } from "./services/leetcode";
import { getCodeChefUser } from "./services/codechef";
import { requireAuth } from "./middleware/auth";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import classRoutes from "./routes/class";
import aiRoutes from "./routes/ai";
import recommendRoutes from "./routes/recommend";
import radarRoutes from "./routes/radar";
import analysisRoutes from "./routes/analysis";
import detailedProfileRoutes from "./routes/detailedProfile";
import contestRoutes from "./routes/contests";
import companyRoutes from "./routes/companies";
import collegeRoutes from "./routes/college";
import courseRoutes from "./routes/course";
import joinRequestRoutes from "./routes/joinRequest";
import adminRoutes from "./routes/admin";
import dsaPracticeRoutes from "./routes/dsaPractice";
import contestHistoryRoutes from "./routes/contestHistory";
import savedContestRoutes from "./routes/savedContests";
import hackathonRoutes from "./routes/hackathons";
import postRoutes from "./routes/posts";
import profileRoutes from "./routes/profiles";

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================== MIDDLEWARE ===================== */
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

/* ===================== HEALTH CHECK ===================== */
app.get("/", (_req, res) => {
  res.send("CPulse backend is running 🚀");
});

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/class", classRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/radar", radarRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api", detailedProfileRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api", courseRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dsa-practice", dsaPracticeRoutes);
app.use("/api/contest-history", contestHistoryRoutes);
app.use("/api/contests/saved", savedContestRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profiles", profileRoutes);

/* ===================== UNIFIED STEALTH METRICS ===================== */
// This endpoint replaces /history to bypass browser ad-blockers
app.get("/api/metrics/:platform/:username", async (req, res) => {
  const { platform, username } = req.params;

  try {
    // 1️⃣ Check DB
    const existing = await User.findOne({
      handle: username,
      platform,
    });

    if (existing) {
        const ex = existing as any;
        return res.json({
          platform: ex.platform,
          handle: ex.handle,
          rating: ex.rating,
          maxRating: ex.maxRating,
          rank: ex.rank,
          maxRank: ex.maxRank,
          totalSolved: ex.totalSolved || ex.problemsSolved || 0,
          cpulseRating: ex.cpulseRating,
          history: ex.history || [],

          // Rich profile fields
          avatar: ex.avatar,
          title: ex.title,
          contribution: ex.contribution,
          friendOfCount: ex.friendOfCount,
          organization: ex.organization,
          lastOnlineTimeSeconds: ex.lastOnlineTimeSeconds,
          contestRating: ex.contestRating,
          globalRanking: ex.globalRanking,
          topPercentage: ex.topPercentage,
          reputation: ex.reputation,
          division: ex.division,
          country: ex.country,

          // Enhanced fields
          badges: ex.badges || [],
          languages: ex.languages || [],
          topTags: ex.topTags || [],
          recentSubmissions: ex.recentSubmissions || [],
          registrationTimeSeconds: ex.registrationTimeSeconds,
          city: ex.city,

          // LeetCode specific
          easySolved: ex.easySolved,
          mediumSolved: ex.mediumSolved,
          hardSolved: ex.hardSolved,
          totalSubmissions: ex.totalSubmissions,
          aboutMe: ex.aboutMe || "",
          skillTags: ex.skillTags || [],
          realName: ex.realName || "",
          company: ex.company || "",
          school: ex.school || "",
          websites: ex.websites || [],

          // CodeChef specific
          stars: ex.stars,
          globalRank: ex.globalRank,
          countryRank: ex.countryRank,
          problemsSolved: ex.problemsSolved,
          contestHistory: ex.contestHistory || [],
          contestsAttended: ex.contestsAttended || 0,
          institution: ex.institution || "",
          heatMap: ex.heatMap || [],
          totalActiveDays: ex.totalActiveDays || 0,
          streak: ex.streak || 0,
          });
        }

    // 2️⃣ Fetch from platform
    let normalizedData: Record<string, any>;

    if (platform === "codeforces") {
      normalizedData = await getUserInfo(username);
    } else if (platform === "leetcode") {
      normalizedData = await getLeetCodeUser(username);
    } else if (platform === "codechef") {
      normalizedData = await getCodeChefUser(username);
    } else {
      return res.status(400).json({ error: "Unsupported platform" });
    }

    // 3️⃣ Save user
    let user = await User.findOne({ handle: normalizedData.handle, platform });

    if (user) {
      user.set(normalizedData);
    } else {
      user = new User(normalizedData);
    }

    await user.save();

    // 4️⃣ Calculate CPulse Rating
    user.cpulseRating = calculateCPulseRating(user);
    await user.save();

    const u = user as any;
      res.json({
        platform: u.platform,
        handle: u.handle,
        rating: u.rating,
        maxRating: u.maxRating,
        rank: u.rank,
        maxRank: u.maxRank,
        totalSolved: u.totalSolved || u.problemsSolved || 0,
        cpulseRating: u.cpulseRating,
        history: u.history || [],

        // Rich profile fields
        avatar: u.avatar,
        title: u.title,
        contribution: u.contribution,
        friendOfCount: u.friendOfCount,
        organization: u.organization,
        lastOnlineTimeSeconds: u.lastOnlineTimeSeconds,
        contestRating: u.contestRating,
        globalRanking: u.globalRanking,
        topPercentage: u.topPercentage,
        reputation: u.reputation,
        division: u.division,
        country: u.country,

        // Enhanced fields
        badges: normalizedData.badges || [],
        languages: normalizedData.languages || [],
        topTags: normalizedData.topTags || [],
        recentSubmissions: normalizedData.recentSubmissions || [],
        registrationTimeSeconds: normalizedData.registrationTimeSeconds,
        city: normalizedData.city,

        // LeetCode specific
        easySolved: u.easySolved,
        mediumSolved: u.mediumSolved,
        hardSolved: u.hardSolved,
        totalSubmissions: normalizedData.totalSubmissions,
        aboutMe: normalizedData.aboutMe || "",
        skillTags: normalizedData.skillTags || [],
        realName: normalizedData.realName || "",
        company: normalizedData.company || "",
        school: normalizedData.school || "",
        websites: normalizedData.websites || [],

        // CodeChef specific
        stars: u.stars,
        globalRank: u.globalRank,
        countryRank: u.countryRank,
        problemsSolved: u.problemsSolved,
        contestHistory: normalizedData.contestHistory || [],
        contestsAttended: normalizedData.contestsAttended || 0,
        institution: normalizedData.institution || "",
        heatMap: normalizedData.heatMap || [],
        totalActiveDays: normalizedData.totalActiveDays || 0,
        streak: normalizedData.streak || 0,
          });
  } catch (err: any) {
    console.error("METRICS ERROR:", err.message);
    res.status(400).json({
      error: "Failed to fetch metrics",
      details: err.message,
    });
  }
});

/* ===================== PROBLEM OF THE DAY ===================== */
app.get("/api/daily-problem", async (_req, res) => {
  try {
    // Rotating set of high-quality problems
    const problems = [
      {
        id: "1",
        title: "Two Sum",
        difficulty: "Easy",
        platform: "leetcode",
        url: "https://leetcode.com/problems/two-sum",
        tags: ["Array", "Hash Table"],
        description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
      },
      {
        id: "cf-1",
        title: "Watermelon",
        difficulty: "Easy",
        platform: "codeforces",
        url: "https://codeforces.com/problemset/problem/4/A",
        tags: ["Brute Force", "Implementation"],
        description: "One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos.",
      },
      {
        id: "cc-1",
        title: "Chef and Brain Speed",
        difficulty: "Easy",
        platform: "codechef",
        url: "https://www.codechef.com/problems/CBSPEED",
        tags: ["Basic Programming"],
        description: "In CodeChef office, the deadline is approaching very fast. The engineers have to finish the work within X hours.",
      }
    ];

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const problem = problems[dayOfYear % problems.length];

    res.json(problem);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get daily problem" });
  }
});

/* ===================== CALCULATE CP SCORE (MIGRATION) ===================== */
app.get("/api/admin/recalculate-cp-scores", async (_req, res) => {
  try {
    const users = await User.find();
    let updatedCount = 0;

    for (const user of users) {
      const cpScore = calculateCPulseRating(user);
      if (user.cpulseRating !== cpScore) {
        user.cpulseRating = cpScore;
        await user.save();
        updatedCount++;
      }
    }

    res.json({
      message: `Recalculated CP scores for ${updatedCount} users`,
      totalUsers: users.length,
      updatedUsers: updatedCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== GLOBAL LEADERBOARD ===================== */
app.get("/api/leaderboard", async (_req, res) => {
  try {
    const users = await User.find()
      .sort({ cpulseRating: -1 })
      .limit(50)
      .select("handle platform rating maxRating rank cpulseRating avatar");

    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});
/* ===================== CLASS LEADERBOARD ===================== */
app.get("/api/leaderboard/class/:classId", requireAuth, async (req, res) => {
  try {
    const { classId } = req.params;

    const users = await User.find({ classId })
      .sort({ cpulseRating: -1 })
      .limit(50)
      .select("-__v");

    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch class leaderboard" });
  }
});

/* ===================== GET CLASSES ===================== */
app.get("/api/classes", async (_req, res) => {
  try {
    const classes = await User.distinct("classId", {
      classId: { $ne: "general" },
    });

    res.json(classes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== ADD USER TO CLASS ===================== */
app.post("/api/class/add", async (req, res) => {
  const { handle, platform, classId } = req.body;

  if (!handle || !platform || !classId) {
    return res
      .status(400)
      .json({ error: "handle, platform, and classId are required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { handle, platform },
      { classId },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Search user first." });
    }

    res.json({
      message: "User added to class successfully",
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== START ===================== */
connectDB();

// Only listen when running directly (not when imported as serverless function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CPulse backend running on port ${PORT}`);
    console.log(`Gemini API Key Loaded: ${process.env.GEMINI_API_KEY ? "Yes (starts with " + process.env.GEMINI_API_KEY.substring(0, 5) + ")" : "No"}`);
  });
}

export default app;
