import { Router } from "express";
import { getAllHackathons } from "../services/hackathonScraper";
import { requireAuth } from "../middleware/auth";
import { SavedHackathon } from "../models/SavedHackathon";

const router = Router();

/**
 * GET /api/hackathons
 * Fetch upcoming hackathons with optional location filter
 */
router.get("/", async (req, res) => {
  try {
    const location = req.query.location as string | undefined;
    const hackathons = await getAllHackathons(false, location);
    res.json({ success: true, hackathons, count: hackathons.length });
  } catch (error: any) {
    console.error("Hackathons route error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch hackathons" });
  }
});

/**
 * POST /api/hackathons/refresh
 * Force refresh hackathon data from all sources
 */
router.post("/refresh", async (req, res) => {
  try {
    const location = req.query.location as string | undefined;
    const hackathons = await getAllHackathons(true, location);
    res.json({ success: true, hackathons, count: hackathons.length });
  } catch (error: any) {
    console.error("Hackathons refresh error:", error.message);
    res.status(500).json({ success: false, error: "Failed to refresh hackathons" });
  }
});

/* -------- Saved Hackathons -------- */

router.get("/saved", requireAuth, async (req, res) => {
  try {
    const saved = await SavedHackathon.find({ userId: (req as any).user.id }).sort({ createdAt: -1 });
    res.json({ success: true, hackathons: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to fetch saved hackathons" });
  }
});

router.post("/saved", requireAuth, async (req, res) => {
  try {
    const { hackathonId, source, name, url, startDate, endDate, location } = req.body;
    const existing = await SavedHackathon.findOne({ userId: (req as any).user.id, hackathonId });
    if (existing) return res.status(409).json({ error: "Already saved" });

    const saved = await SavedHackathon.create({
      userId: (req as any).user.id,
      hackathonId,
      source,
      name,
      url,
      startDate,
      endDate,
      location: location || "",
    });
    res.json({ success: true, hackathon: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to save hackathon" });
  }
});

router.delete("/saved/:hackathonId", requireAuth, async (req, res) => {
  try {
    await SavedHackathon.findOneAndDelete({
      userId: (req as any).user.id,
      hackathonId: req.params.hackathonId,
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to remove saved hackathon" });
  }
});

export default router;
