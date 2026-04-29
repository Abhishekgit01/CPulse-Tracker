import { Router } from "express";
import { getMetricsForUser } from "../services/platformMetrics";

const router = Router();

router.get("/metrics/:platform/:username", async (req, res) => {
  try {
    const metrics = await getMetricsForUser(
      req.params.platform,
      req.params.username
    );

    res.json(metrics);
  } catch (error: any) {
    console.error("METRICS ERROR:", error.message);
    res.status(400).json({
      error: "Failed to fetch metrics",
      details: error.message,
    });
  }
});

export default router;
