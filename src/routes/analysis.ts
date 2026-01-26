import express from "express";
import axios from "axios";
import { User } from "../models/User";

const router = express.Router();

router.get("/:platform/:handle", async (req, res) => {
    try {
        const { platform, handle } = req.params;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Gemini API key not configured" });
        }

        // 1. Fetch user data from DB
        const user = await User.findOne({ handle, platform });
        if (!user) {
            return res.status(404).json({ error: "User not found. Please sync profile first." });
        }

        // 2. Prepare context for AI
        const context = {
            handle: user.handle,
            platform: user.platform,
            rating: user.rating,
            cpulseScore: user.cpulseRating,
            rank: user.rank,
            totalSolved: user.totalSolved,
            history: user.history?.slice(-5) || [] // Last 5 data points for trend
        };

        const prompt = `
            Analyze this competitive programmer's profile:
            ${JSON.stringify(context, null, 2)}

            Output exactly in this JSON format (no other text):
            {
                "bio": "A professional 3-line summary for their portfolio.",
                "vibe": "Select one: 'Grind Mode', 'Zen Master', 'Code Ninja', 'Logic Architect', 'Speedster'.",
                "vibeQuote": "A 1-line motivational quote in that vibe.",
                "strength": "The most impressive technical attribute they have.",
                "weakness": "A constructive area for improvement.",
                "roadmapTip": "A specific high-level advice to reach the next big milestone.",
                "cleanCodeTip": "A short piece of advice on code quality or problem-solving strategy."
            }
        `;

        // 3. Call Gemini
        const aiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            }
        );

        let result;
        try {
            const content = aiResponse.data.candidates[0].content.parts[0].text;
            result = JSON.parse(content);
        } catch (e) {
            console.error("AI JSON Parse Error:", e);
            result = {
                bio: `${user.handle} is an active ${user.platform} programmer with a CPulse score of ${user.cpulseRating}.`,
                vibe: "Code Ninja",
                vibeQuote: "Keep coding, keep growing.",
                strength: "Consistency in solving.",
                weakness: "Could tackle more diverse problems.",
                roadmapTip: "Continue practicing medium-level problems.",
                cleanCodeTip: "Focus on modularizing your logic."
            };
        }

        res.json(result);

    } catch (error: any) {
        console.error("ANALYSIS ERROR:", error.message);
        res.status(500).json({ error: "Failed to generate AI analysis" });
    }
});

export default router;
