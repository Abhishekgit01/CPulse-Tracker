import { Router } from "express";
import { Contest } from "../models/Contest";
import { updateAllContests } from "../services/contestScraper";

const router = Router();

/**
 * GET /api/contests
 * Get all upcoming contests, optionally filtered by platform
 */
router.get("/", async (req, res) => {
    try {
        const { platform } = req.query;

        const filter: any = {
            startTime: { $gte: new Date() }, // Only future contests
        };

        if (platform && typeof platform === "string") {
            filter.platform = platform;
        }

        const contests = await Contest.find(filter)
            .sort({ startTime: 1 }) // Sort by start time ascending
            .limit(100);

        res.json({
            success: true,
            count: contests.length,
            contests,
        });
    } catch (error: any) {
        console.error("Error fetching contests:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch contests",
            details: error.message,
        });
    }
});

/**
 * GET /api/contests/:platform
 * Get upcoming contests for a specific platform
 */
router.get("/:platform", async (req, res) => {
    try {
        const { platform } = req.params;

        if (!["codeforces", "codechef", "leetcode", "atcoder"].includes(platform)) {
            return res.status(400).json({
                success: false,
                error: "Invalid platform. Must be one of: codeforces, codechef, leetcode, atcoder",
            });
        }

        const contests = await Contest.find({
            platform,
            startTime: { $gte: new Date() },
        })
            .sort({ startTime: 1 })
            .limit(50);

        res.json({
            success: true,
            platform,
            count: contests.length,
            contests,
        });
    } catch (error: any) {
        console.error(`Error fetching ${req.params.platform} contests:`, error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch contests",
            details: error.message,
        });
    }
});

/**
 * POST /api/contests/refresh
 * Manually trigger contest data refresh (admin endpoint)
 */
router.post("/refresh", async (req, res) => {
    try {
        const result = await updateAllContests();

        res.json({
            success: true,
            message: "Contests refreshed successfully",
            stats: result,
        });
    } catch (error: any) {
        console.error("Error refreshing contests:", error);
        res.status(500).json({
            success: false,
            error: "Failed to refresh contests",
            details: error.message,
        });
    }
});

/**
 * GET /api/contests/stats
 * Get contest statistics
 */
router.get("/stats/summary", async (req, res) => {
    try {
        const totalUpcoming = await Contest.countDocuments({
            startTime: { $gte: new Date() },
        });

        const byPlatform = await Contest.aggregate([
            { $match: { startTime: { $gte: new Date() } } },
            { $group: { _id: "$platform", count: { $sum: 1 } } },
        ]);

        const platformStats = byPlatform.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            success: true,
            stats: {
                totalUpcoming,
                byPlatform: platformStats,
            },
        });
    } catch (error: any) {
        console.error("Error fetching contest stats:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch contest stats",
            details: error.message,
        });
    }
});

export default router;
