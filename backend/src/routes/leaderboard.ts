import { Router } from "express";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/leaderboard", async (_req, res) => {
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

router.get("/leaderboard/class/:classId", requireAuth, async (req, res) => {
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

export default router;
