import { useEffect, useState } from "react";
import api from "../api/axios";

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  platform: "codeforces" | "codechef" | "leetcode";
  url: string;
  tags: string[];
  acceptanceRate?: number;
  rating?: number;
  solvedCount?: number;
  submissionCount?: number;
  description?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  Medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  Hard: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
};

const PLATFORM_COLORS: Record<string, string> = {
  codeforces: "from-red-500 to-red-600",
  codechef: "from-amber-600 to-amber-700",
  leetcode: "from-yellow-500 to-yellow-600",
};

const PLATFORM_LOGOS: Record<string, string> = {
  codeforces: "🔴",
  codechef: "🟠",
  leetcode: "🟨",
};

export default function ProblemOfTheDay() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dayIndex, setDayIndex] = useState(0);

  // Sample problems database (in real app, would come from backend)
  const sampleProblems: Problem[] = [
    {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      platform: "leetcode",
      url: "https://leetcode.com/problems/two-sum",
      tags: ["Array", "Hash Table"],
      acceptanceRate: 48.1,
      solvedCount: 1200000,
      submissionCount: 2500000,
      description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
    },
    {
      id: "2",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      platform: "leetcode",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters",
      tags: ["Hash Table", "Sliding Window", "String"],
      acceptanceRate: 33.8,
      solvedCount: 850000,
      submissionCount: 2500000,
      description: "Given a string s, find the length of the longest substring without repeating characters.",
    },
    {
      id: "3",
      title: "Word Ladder",
      difficulty: "Hard",
      platform: "leetcode",
      url: "https://leetcode.com/problems/word-ladder",
      tags: ["Breadth-First Search", "String", "Graph"],
      acceptanceRate: 37.2,
      solvedCount: 400000,
      submissionCount: 1100000,
      description: "Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence.",
    },
    {
      id: "4",
      title: "A + B Problem",
      difficulty: "Easy",
      platform: "codeforces",
      url: "https://codeforces.com/problemset/problem/1/A",
      tags: ["Implementation"],
      rating: 800,
      description: "Two integer numbers a and b are given. You should calculate their sum and print it.",
    },
    {
      id: "5",
      title: "Palindrome Check",
      difficulty: "Easy",
      platform: "codechef",
      url: "https://www.codechef.com",
      tags: ["String", "Basic"],
      rating: 1000,
      description: "Given a string, determine if it is a palindrome, considering only alphanumeric characters.",
    },
    {
      id: "6",
      title: "Merge K Sorted Lists",
      difficulty: "Hard",
      platform: "leetcode",
      url: "https://leetcode.com/problems/merge-k-sorted-lists",
      tags: ["Linked List", "Divide and Conquer", "Heap"],
      acceptanceRate: 42.8,
      solvedCount: 500000,
      submissionCount: 1200000,
      description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
    },
    {
      id: "7",
      title: "Binary Search Tree Validation",
      difficulty: "Medium",
      platform: "leetcode",
      url: "https://leetcode.com/problems/validate-binary-search-tree",
      tags: ["Tree", "Depth-First Search"],
      acceptanceRate: 33.2,
      solvedCount: 700000,
      submissionCount: 2100000,
      description: "Given the root of a binary tree, determine if it is a valid binary search tree.",
    },
  ];

  useEffect(() => {
    const fetchProblemOfDay = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/daily-problem");
        setProblem(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load problem of the day");
        setLoading(false);
      }
    };

    fetchProblemOfDay();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="text-center py-20 text-red-500">
        {error || "Problem not available"}
      </div>
    );
  }

  const acceptancePercentage =
    problem.acceptanceRate?.toFixed(1) || "N/A";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{PLATFORM_LOGOS[problem.platform]}</span>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
            Problem of the Day
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {problem.title}
        </h1>
      </div>

      {/* Main Card */}
      <div
        className={`bg-gradient-to-br ${PLATFORM_COLORS[problem.platform]} rounded-xl shadow-lg overflow-hidden mb-6`}
      >
        <div className="bg-white dark:bg-gray-800 p-8">
          {/* Problem Meta */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div>
              <span
                className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${DIFFICULTY_COLORS[problem.difficulty] || 'bg-gray-200'}`}
              >
                {problem.difficulty || 'Unknown'}
              </span>
            </div>

            {/* Platform Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${PLATFORM_COLORS[problem.platform || 'unknown']} text-white font-semibold text-sm`}
            >
              {(problem.platform || 'Unknown').charAt(0).toUpperCase() +
                (problem.platform || 'Unknown').slice(1)}
            </div>

            {/* Rating/Acceptance */}
            {problem.acceptanceRate && (
              <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold text-sm">
                {acceptancePercentage}% Acceptance
              </div>
            )}
            {problem.rating && (
              <div className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-semibold text-sm">
                Rating: {problem.rating}
              </div>
            )}
          </div>

          {/* Description */}
          {problem.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Problem Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {problem.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {problem.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            {problem.solvedCount && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(problem.solvedCount / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Solved
                </div>
              </div>
            )}
            {problem.submissionCount && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(problem.submissionCount / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Submissions
                </div>
              </div>
            )}
            {problem.acceptanceRate && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {acceptancePercentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Acceptance
                </div>
              </div>
            )}
            {problem.rating && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {problem.rating}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Rating
                </div>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg transition transform hover:scale-105"
            >
              🚀 Solve Problem
            </a>
            <button
              onClick={() => {
                const nextIndex = (dayIndex + 1) % 8;
                setDayIndex(nextIndex);
                setProblem(null);
                setTimeout(() => {
                  const sampleProblems = [
                    {
                      id: "1",
                      title: "Two Sum",
                      difficulty: "Easy" as const,
                      platform: "leetcode" as const,
                      url: "https://leetcode.com/problems/two-sum",
                      tags: ["Array", "Hash Table"],
                      acceptanceRate: 48.1,
                      solvedCount: 1200000,
                      submissionCount: 2500000,
                      description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
                    },
                    {
                      id: "2",
                      title: "Longest Substring Without Repeating Characters",
                      difficulty: "Medium" as const,
                      platform: "leetcode" as const,
                      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters",
                      tags: ["Hash Table", "Sliding Window", "String"],
                      acceptanceRate: 33.8,
                      solvedCount: 850000,
                      submissionCount: 2500000,
                      description: "Given a string s, find the length of the longest substring without repeating characters.",
                    },
                    {
                      id: "3",
                      title: "Word Ladder",
                      difficulty: "Hard" as const,
                      platform: "leetcode" as const,
                      url: "https://leetcode.com/problems/word-ladder",
                      tags: ["Breadth-First Search", "String", "Graph"],
                      acceptanceRate: 37.2,
                      solvedCount: 400000,
                      submissionCount: 1100000,
                      description: "Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence.",
                    },
                    {
                      id: "4",
                      title: "A + B Problem",
                      difficulty: "Easy" as const,
                      platform: "codeforces" as const,
                      url: "https://codeforces.com/problemset/problem/1/A",
                      tags: ["Implementation"],
                      rating: 800,
                      description: "Two integer numbers a and b are given. You should calculate their sum and print it.",
                    },
                    {
                      id: "5",
                      title: "Palindrome Check",
                      difficulty: "Easy" as const,
                      platform: "codechef" as const,
                      url: "https://www.codechef.com",
                      tags: ["String", "Basic"],
                      rating: 1000,
                      description: "Given a string, determine if it is a palindrome, considering only alphanumeric characters.",
                    },
                    {
                      id: "6",
                      title: "Merge K Sorted Lists",
                      difficulty: "Hard" as const,
                      platform: "leetcode" as const,
                      url: "https://leetcode.com/problems/merge-k-sorted-lists",
                      tags: ["Linked List", "Divide and Conquer", "Heap"],
                      acceptanceRate: 42.8,
                      solvedCount: 500000,
                      submissionCount: 1200000,
                      description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
                    },
                    {
                      id: "7",
                      title: "Binary Search Tree Validation",
                      difficulty: "Medium" as const,
                      platform: "leetcode" as const,
                      url: "https://leetcode.com/problems/validate-binary-search-tree",
                      tags: ["Tree", "Depth-First Search"],
                      acceptanceRate: 33.2,
                      solvedCount: 700000,
                      submissionCount: 2100000,
                      description: "Given the root of a binary tree, determine if it is a valid binary search tree.",
                    },
                  ];
                  setProblem(sampleProblems[nextIndex]);
                }, 300);
              }}
              className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ⟳ Next Problem
            </button>
          </div>
        </div>
      </div>

      {/* Daily Motivation */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6 text-center">
        <p className="text-lg font-semibold">✨ Daily Challenge</p>
        <p className="mt-2 text-indigo-100">
          Solve today's problem to boost your competitive programming skills!
        </p>
      </div>
    </div>
  );
}
