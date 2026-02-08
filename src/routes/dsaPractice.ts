import { Router } from "express";
import axios from "axios";

const router = Router();

async function geminiWithRetry(url: string, body: any, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await axios.post(url, body, { timeout: 30000 });
    } catch (err: any) {
      if (err.response?.status === 429 && attempt < maxRetries - 1) {
        const delay = (attempt + 1) * 3000;
        console.log(`[DSA Practice] Gemini 429, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

interface DSAQuestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hint1: string;
  hint2: string;
  solutionParts: [string, string, string]; // 3 parts of the solution
  fullExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  language: string;
}

const TOPICS = [
  "Arrays", "Strings", "Hash Table", "Two Pointers", "Sliding Window",
  "Binary Search", "Linked List", "Stack", "Queue", "Trees",
  "Binary Search Tree", "Heap / Priority Queue", "Graphs", "BFS", "DFS",
  "Dynamic Programming", "Greedy", "Backtracking", "Recursion",
  "Sorting", "Bit Manipulation", "Math", "Trie", "Union Find",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// POST /api/dsa-practice/generate
router.post("/generate", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
    }

    const { difficulty, topic, language } = req.body;
    const diff = DIFFICULTIES.includes(difficulty) ? difficulty : "Medium";
    const lang = language || "C++";
    const topicHint = topic && TOPICS.includes(topic) ? topic : TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const prompt = `You are a DSA question generator. Generate ONE unique competitive programming / DSA interview question.

Requirements:
- Difficulty: ${diff}
- Primary topic: ${topicHint}
- Solution language: ${lang}

Return ONLY valid JSON (no markdown fences, no extra text) with this exact structure:
{
  "title": "Problem Title",
  "difficulty": "${diff}",
  "tags": ["${topicHint}", ...other relevant tags],
  "description": "Full problem statement in plain text. Be detailed and clear.",
  "examples": [
    {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9"},
    {"input": "...", "output": "..."}
  ],
  "constraints": ["1 <= nums.length <= 10^4", "..."],
  "hint1": "A small nudge hint (e.g. 'Think about using a hash map to store seen values')",
  "hint2": "A bigger hint that reveals the approach but not the code (e.g. 'Iterate through the array, for each element check if target - element exists in the hash map')",
  "solutionParts": [
    "// Part 1: Setup and data structures\\n<first ~1/3 of the solution code>",
    "// Part 2: Core logic\\n<middle ~1/3 of the solution code>",
    "// Part 3: Final processing and return\\n<last ~1/3 of the solution code>"
  ],
  "fullExplanation": "Detailed explanation of the approach, why it works, and step-by-step walkthrough.",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "language": "${lang}"
}

IMPORTANT:
- The 3 solutionParts must be a COMPLETE, WORKING solution when concatenated together. Each part should be roughly equal in size.
- Part 1 should include includes/imports, function signature, and initial setup.
- Part 2 should include the core algorithm logic.
- Part 3 should include final computation and return statement, plus closing braces.
- Make the problem unique and interesting, not a direct copy of a well-known problem. Put your own creative spin.
- Escape all special characters properly for valid JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await geminiWithRetry(url, {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
        },
      });

      const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    // Parse JSON - strip markdown fences if present
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const question: DSAQuestion = JSON.parse(cleaned);

    // Validate structure
    if (
      !question.title ||
      !question.description ||
      !Array.isArray(question.solutionParts) ||
      question.solutionParts.length !== 3
    ) {
      throw new Error("Invalid question structure from AI");
    }

    res.json(question);
    } catch (err: any) {
      console.error("[DSA Practice] Error:", err.message);
      const is429 = err.response?.status === 429;
      res.status(is429 ? 429 : 500).json({
        error: is429
          ? "AI rate limit reached. Please wait a moment and try again."
          : "Failed to generate question",
        details: err.message,
      });
    }
});

// GET /api/dsa-practice/topics
router.get("/topics", (_req, res) => {
  res.json({ topics: TOPICS, difficulties: DIFFICULTIES });
});

export default router;
