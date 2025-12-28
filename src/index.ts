import express from "express";
import { getUserInfo } from "./services/codeforces";
import { connectDB } from "./db/mongo";
import { User } from "./models/User";
import { getLeetCodeUser } from "./services/leetcode";

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("CPulse backend running");
});

app.get("/leaderboard/combined", async (req, res) => {
  try {
    // Fetch top Codeforces users
    const cfUsers = await User.find({ platform: "codeforces" })
      .sort({ rating: -1 })
      .limit(50)
      .select("-__v"); // exclude internal fields

    // Fetch top LeetCode users
    const lcUsers = await User.find({ platform: "leetcode" })
      .sort({ totalSolved: -1 })
      .limit(50)
      .select("-__v");

    // Merge into one array
    const combined = [...cfUsers, ...lcUsers];

    // Optional: sort combined by a "score" field if you want one metric
    // For now we just return CF and LC together
    res.json(combined);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/leetcode/save/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch data from LeetCode
    const data = await getLeetCodeUser(username);

    // Save or update in MongoDB
    const user = await User.findOneAndUpdate(
      { handle: data.username, platform: "leetcode" },
      { ...data, platform: "leetcode" },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/codeforces/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const data = await getUserInfo(handle);

    // Save or update user in MongoDB
    await User.findOneAndUpdate(
      { handle: data.handle }, // find by handle
      data,                    // update with latest data
      { upsert: true, new: true } // create if not exists, return updated doc
    );

    res.json(data); // return the normalized data
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch or save Codeforces data" });
  }
});

// Leaderboard endpoint — returns top Codeforces users
app.get("/leaderboard", async (req, res) => {
  try {
    // Fetch all users, sorted by rating descending
    const users = await User.find().sort({ rating: -1 }).limit(50);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Personal growth endpoint — returns historical ratings for a user
app.get("/growth/:handle", async (req, res) => {
  try {
    const { handle } = req.params;

    // Fetch all historical updates for this user
    const userHistory = await User.find({ handle }).sort({ updatedAt: 1 });

    // Map to only relevant info for charts
    const growthData = userHistory.map((u) => ({
      rating: u.rating,
      date: u.updatedAt,
    }));

    res.json(growthData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch personal growth data" });
  }
});

// Class-wise leaderboard
app.get("/leaderboard/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params;

    // Fetch top users in that class
    const users = await User.find({ classId })
      .sort({ rating: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch class leaderboard" });
  }
});


connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
