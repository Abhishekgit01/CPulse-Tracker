import { Router } from "express";
import { User } from "../models/User";
import axios from "axios";

const router = Router();

// 1. Get List of all active classes
router.get("/list", async (_req, res) => {
    try {
        const classes = await User.distinct("classId", { classId: { $ne: "general" } });
        res.json({ classes });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// 2. Get Statistics for a specific class
router.get("/:classId/stats", async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await User.find({ classId }).sort({ cpulseRating: -1 });

        if (students.length === 0) {
            return res.status(404).json({ error: "Class not found or empty" });
        }

        const totalStudents = students.length;
        const avgCPulse = students.reduce((acc, s) => acc + (s.cpulseRating || 0), 0) / totalStudents;

        // Count by platform
        const platformCounts = students.reduce((acc: any, s) => {
            acc[s.platform] = (acc[s.platform] || 0) + 1;
            return acc;
        }, {});

        // Top platform
        const topPlatform = Object.entries(platformCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "None";

        res.json({
            classId,
            totalStudents,
            avgCPulse: Math.round(avgCPulse),
            topPlatform,
            platformDistribution: platformCounts,
            leaderboard: students.map(s => ({
                handle: s.handle,
                platform: s.platform,
                cpulseRating: s.cpulseRating,
                rating: s.rating
            }))
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch class stats" });
    }
});

// 3. AI Insights for Class
router.get("/:classId/ai-insights", async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await User.find({ classId }).sort({ cpulseRating: -1 }).limit(10);

        if (students.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "Gemini Key missing" });

        const prompt = `You are an expert Professor and Competitive Programming Mentor. 
        I'm providing you data for a class of students with ID: ${classId}.
        Top Students Data:
        ${students.map(s => `- ${s.handle} (${s.platform}): Rating ${s.cpulseRating}`).join("\n")}
        
        Please provide a professional yet encouraging "Class Progress Report". 
        - Briefly summarize the class level.
        - Suggest 2 relative strengths seen in the handles (e.g. "Diverse platform usage", "Consistent performers at the top").
        - Provide one clear collective goal for next week.
        
        Keep it brief and use markdown. Use professional formatting.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const insights = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights available right now.";
        res.json({ insights });
    } catch (error: any) {
        console.error("AI CLASS ERROR:", error.message);
        res.status(500).json({ error: "Failed to generate AI insights" });
    }
});

export default router;
