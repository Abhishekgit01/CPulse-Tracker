import { Router } from "express";
import axios from "axios";
import questions, { DSAQuestion } from "../data/dsaQuestions";

const PISTON_URL = "https://emkc.org/api/v2/piston";

const LANG_MAP: Record<string, { language: string; version: string }> = {
  "cpp": { language: "c++", version: "10.2.0" },
  "c": { language: "c", version: "10.2.0" },
  "python": { language: "python", version: "3.10.0" },
  "java": { language: "java", version: "15.0.2" },
  "javascript": { language: "javascript", version: "18.15.0" },
};

const router = Router();

const TOPICS = [
  "Arrays", "Strings", "Hash Table", "Two Pointers", "Sliding Window",
  "Binary Search", "Linked List", "Stack", "Queue", "Trees",
  "Binary Search Tree", "Heap / Priority Queue", "Graphs", "BFS", "DFS",
  "Dynamic Programming", "Greedy", "Backtracking", "Recursion",
  "Sorting", "Bit Manipulation", "Math", "Trie", "Union Find",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// Track recently served question ids per session to avoid repeats
const recentlyServed: string[] = [];
const MAX_RECENT = 10;

// POST /api/dsa-practice/generate
router.post("/generate", (req, res) => {
  try {
    const { difficulty, topic } = req.body || {};

    // Filter by difficulty
    let pool: DSAQuestion[] = questions;
    if (difficulty && DIFFICULTIES.includes(difficulty)) {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }

    // Filter by topic
    if (topic && TOPICS.includes(topic)) {
      pool = pool.filter((q) => q.tags.includes(topic));
    }

    // If no matches after filtering, relax to just difficulty
    if (pool.length === 0 && difficulty) {
      pool = questions.filter((q) => q.difficulty === difficulty);
    }

    // Still nothing? use all questions
    if (pool.length === 0) {
      pool = questions;
    }

    // Prefer questions not recently served
    let candidates = pool.filter((q) => !recentlyServed.includes(q.id));
    if (candidates.length === 0) {
      candidates = pool;
      recentlyServed.length = 0; // reset
    }

    // Pick random
    const question = candidates[Math.floor(Math.random() * candidates.length)];

    // Track as recently served
    recentlyServed.push(question.id);
    if (recentlyServed.length > MAX_RECENT) {
      recentlyServed.shift();
    }

    res.json(question);
  } catch (err: any) {
    console.error("[DSA Practice] Error:", err.message);
    res.status(500).json({ error: "Failed to get question" });
  }
});

// GET /api/dsa-practice/topics
router.get("/topics", (_req, res) => {
  res.json({ topics: TOPICS, difficulties: DIFFICULTIES });
});

// GET /api/dsa-practice/count — helpful for the frontend to show total questions
router.get("/count", (_req, res) => {
  const byDifficulty = {
    Easy: questions.filter((q) => q.difficulty === "Easy").length,
    Medium: questions.filter((q) => q.difficulty === "Medium").length,
    Hard: questions.filter((q) => q.difficulty === "Hard").length,
  };
  res.json({ total: questions.length, byDifficulty });
});

// POST /api/dsa-practice/run — execute code via Piston API
router.post("/run", async (req, res) => {
  try {
    const { code, language, stdin } = req.body || {};
    if (!code || !language) {
      return res.status(400).json({ error: "code and language are required" });
    }

    const langConfig = LANG_MAP[language];
    if (!langConfig) {
      return res.status(400).json({ error: `Unsupported language: ${language}. Supported: ${Object.keys(LANG_MAP).join(", ")}` });
    }

    const response = await axios.post(`${PISTON_URL}/execute`, {
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: code }],
      stdin: stdin || "",
      compile_timeout: 10000,
      run_timeout: 5000,
    }, { timeout: 15000 });

    const { run, compile } = response.data;

    res.json({
      output: run?.output || "",
      stdout: run?.stdout || "",
      stderr: run?.stderr || "",
      exitCode: run?.code ?? -1,
      signal: run?.signal || null,
      compileOutput: compile?.output || "",
      compileError: compile?.stderr || "",
    });
  } catch (err: any) {
    console.error("[DSA Practice] Run error:", err.message);
    if (err.response?.status === 429) {
      return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
    }
    res.status(500).json({ error: "Code execution failed. Please try again." });
  }
});

// GET /api/dsa-practice/languages — list supported languages
router.get("/languages", (_req, res) => {
  const langs = Object.entries(LANG_MAP).map(([key, val]) => ({
    id: key,
    name: key === "cpp" ? "C++" : key === "c" ? "C" : key === "javascript" ? "JavaScript" : key.charAt(0).toUpperCase() + key.slice(1),
    version: val.version,
  }));
  res.json(langs);
});

export default router;
