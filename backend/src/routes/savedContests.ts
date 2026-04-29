import { Router } from "express";
import { SavedContest } from "../models/SavedContest";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/contests/saved
 * Get user's saved/bookmarked contests
 */
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const saved = await SavedContest.find({ userId }).sort({ startTime: 1 });
    res.json({ success: true, contests: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/contests/saved
 * Save/bookmark a contest
 */
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { contestId, platform, name, startTime, duration, url } = req.body;

    if (!contestId || !platform || !name || !startTime || !duration || !url) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const existing = await SavedContest.findOne({ userId, contestId });
    if (existing) {
      return res.status(409).json({ success: false, error: "Contest already saved" });
    }

    const saved = await SavedContest.create({
      userId,
      contestId,
      platform,
      name,
      startTime: new Date(startTime),
      duration,
      url,
    });

    res.status(201).json({ success: true, contest: saved });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "Contest already saved" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/contests/saved/:contestId
 * Remove a saved contest by contestId
 */
router.delete("/:contestId", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { contestId } = req.params;

    const result = await SavedContest.findOneAndDelete({ userId, contestId });
    if (!result) {
      return res.status(404).json({ success: false, error: "Saved contest not found" });
    }

    res.json({ success: true, message: "Contest removed" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/contests/saved/:contestId/participated
 * Mark a saved contest as participated
 */
router.patch("/:contestId/participated", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { contestId } = req.params;
    const { participated } = req.body;

    const saved = await SavedContest.findOneAndUpdate(
      { userId, contestId },
      { participated: participated !== false },
      { new: true }
    );

    if (!saved) {
      return res.status(404).json({ success: false, error: "Saved contest not found" });
    }

    res.json({ success: true, contest: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
