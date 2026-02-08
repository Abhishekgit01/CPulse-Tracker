import { Router } from "express";
import { getAllHackathons } from "../services/hackathonScraper";

const router = Router();

/**
 * GET /api/hackathons
 * Fetch upcoming hackathons from Devfolio, MLH, and Devpost
 */
router.get("/", async (_req, res) => {
  try {
    const hackathons = await getAllHackathons();
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
router.post("/refresh", async (_req, res) => {
  try {
    const hackathons = await getAllHackathons(true);
    res.json({ success: true, hackathons, count: hackathons.length });
  } catch (error: any) {
    console.error("Hackathons refresh error:", error.message);
    res.status(500).json({ success: false, error: "Failed to refresh hackathons" });
  }
});

export default router;
