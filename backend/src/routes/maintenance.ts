import { Router } from "express";
import { recalculateAllCPulseRatings } from "../services/ratingMaintenance";

const router = Router();

router.get("/recalculate-cp-scores", async (_req, res) => {
  try {
    const { totalUsers, updatedUsers } = await recalculateAllCPulseRatings();

    res.json({
      message: `Recalculated CP scores for ${updatedUsers} users`,
      totalUsers,
      updatedUsers,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
