import { Router } from "express";
import axios from "axios";
import { User } from "../models/User";

const router = Router();

// Mapping of CF tags to general categories
const CATEGORY_MAP: Record<string, string> = {
    "math": "Math", "number theory": "Math", "probabilities": "Math", "combinatorics": "Math", "geometry": "Math",
    "dp": "DP",
    "graphs": "Graphs", "trees": "Graphs", "shortest paths": "Graphs", "dfs and similar": "Graphs",
    "implementation": "Implementation", "brute force": "Implementation", "constructive algorithms": "Implementation",
    "data structures": "Data Structures", "dsu": "Data Structures", "strings": "Data Structures", "bitmasks": "Data Structures",
    "greedy": "Greedy/Sorting", "sortings": "Greedy/Sorting", "binary search": "Greedy/Sorting", "two pointers": "Greedy/Sorting"
};

router.get("/:platform/:handle", async (req, res) => {
    try {
        const { platform, handle } = req.params;
        const apiKey = process.env.GEMINI_API_KEY;

        if (platform !== "codeforces") {
            return res.status(400).json({ error: "Radar currently only supports Codeforces handles" });
        }

        // 1. Fetch Submissions from Codeforces
        const cfRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
        const submissions = cfRes.data.result;

        // 2. Aggregate Tags
        const counts: Record<string, number> = {
            "Math": 0, "DP": 0, "Graphs": 0, "Implementation": 0, "Data Structures": 0, "Greedy/Sorting": 0
        };

        const solvedProblems = new Set();
        submissions.forEach((sub: any) => {
            if (sub.verdict === "OK" && sub.problem.tags) {
                const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
                if (!solvedProblems.has(problemId)) {
                    solvedProblems.add(problemId);
                    sub.problem.tags.forEach((tag: string) => {
                        const cat = CATEGORY_MAP[tag];
                        if (cat) counts[cat]++;
                    });
                }
            }
        });

        // Normalize to a percentage or relative score for the radar (0-100)
        const maxCount = Math.max(...Object.values(counts), 1);
        const radarData = Object.entries(counts).map(([name, value]) => ({
            subject: name,
            A: Math.round((value / maxCount) * 100),
            fullMark: 100
        }));

        // 3. Generate AI Summary (5-8 lines)
        let summary = "No summary available.";
        if (apiKey) {
            const prompt = `Analyze this competitive programmer's skill distribution:
            ${JSON.stringify(counts)}
            Total Solved Unique Problems: ${solvedProblems.size}
            Handle: ${handle}
            
            Provide a technical, highly professional skill summary for their portfolio.
            STRICT RULES:
            - Must be exactly 5 to 8 lines.
            - Professional tone.
            - Focus on strengths and potential career paths based on these skills (e.g. Finance for Math, Systems for DP).
            - Use markdown.`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
            const aiRes = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }]
            });
            summary = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || summary;
        }

        res.json({
            radarData,
            summary,
            counts
        });

    } catch (error: any) {
        console.error("RADAR ERROR:", error.message);
        res.status(500).json({ error: "Failed to generate radar data" });
    }
});

export default router;
