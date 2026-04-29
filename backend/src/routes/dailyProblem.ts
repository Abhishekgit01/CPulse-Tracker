import { Router } from "express";

const router = Router();

const DAILY_PROBLEMS = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    platform: "leetcode",
    url: "https://leetcode.com/problems/two-sum",
    tags: ["Array", "Hash Table"],
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
  },
  {
    id: "cf-1",
    title: "Watermelon",
    difficulty: "Easy",
    platform: "codeforces",
    url: "https://codeforces.com/problemset/problem/4/A",
    tags: ["Brute Force", "Implementation"],
    description:
      "One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos.",
  },
  {
    id: "cc-1",
    title: "Chef and Brain Speed",
    difficulty: "Easy",
    platform: "codechef",
    url: "https://www.codechef.com/problems/CBSPEED",
    tags: ["Basic Programming"],
    description:
      "In CodeChef office, the deadline is approaching very fast. The engineers have to finish the work within X hours.",
  },
];

router.get("/daily-problem", async (_req, res) => {
  try {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );

    res.json(DAILY_PROBLEMS[dayOfYear % DAILY_PROBLEMS.length]);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get daily problem" });
  }
});

export default router;
