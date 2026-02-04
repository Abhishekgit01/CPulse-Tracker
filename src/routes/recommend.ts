import { Router } from "express";
import { getRecommendations } from "../services/recommend";
import axios from "axios";

const router = Router();

router.get("/:handle/:rating", async (req, res) => {
    try {
        const { handle, rating } = req.params;
        const userRating = parseInt(rating) || 1200;

        const candidates = await getRecommendations(handle, userRating);

        if (candidates.length === 0) {
            return res.json({ recommendations: [], note: "No candidates found in your range." });
        }

        // Optional: Use Gemini to pick the best 3 and explain why + add a hint
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const prompt = `You are a CP Coach. I have a list of unsolved Codeforces problems for a user with rating ${userRating}.
      Pick 3 problems that offer a good variety of topics (e.g., one DP, one Greedy, one Math/Graphs).
      For each problem, provide:
      1. A short reason why it's good for improvement.
      2. A 'hint' - a spoiler-free technical nudge to help them start.
      
      Candidates:
      ${candidates.slice(0, 10).map(p => `- ${p.name} (Rating: ${p.rating}, Tags: ${p.tags.join(", ")}, Link: https://codeforces.com/problemset/problem/${p.contestId}/${p.index})`).join("\n")}
      
      Return EXACTLY as JSON in this format:
      {
        "recommendations": [
          { 
            "name": "Problem Name", 
            "rating": 1500, 
            "tags": ["tag1"], 
            "link": "url", 
            "reason": "reason",
            "hint": "A subtle technical nudge..."
          }
        ]
      }`;

            try {
                const aiResponse = await axios.post(url, {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                const content = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                const parsed = JSON.parse(content);
                return res.json(parsed);
            } catch (aiErr) {
                console.warn("AI Recommendation failed, falling back to random:", aiErr);
            }
        }

        // Fallback if no AI Key or AI fails
        const randomPicks = candidates.sort(() => 0.5 - Math.random()).slice(0, 3).map(p => ({
            name: p.name,
            rating: p.rating,
            tags: p.tags,
            link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            reason: "Great challenge for your current level!"
        }));

        res.json({ recommendations: randomPicks });

    } catch (error) {
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
});

export default router;
