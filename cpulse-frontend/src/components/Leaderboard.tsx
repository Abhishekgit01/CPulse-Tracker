import { useEffect, useState } from "react";
import api from "../api/axios";

interface LeaderboardUser {
  handle: string;
  platform: "codeforces" | "leetcode" | "codechef";
  cpulseRating?: number;
  rating?: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leaderboard")
      .then((res) => {
        // Assign default CP score of 0 to accounts without one
        const processedUsers = (res.data || []).map((user: LeaderboardUser) => ({
          ...user,
          cpulseRating: user.cpulseRating ?? user.rating ?? 0,
        }));
        // Sort by rating descending
        processedUsers.sort((a: LeaderboardUser, b: LeaderboardUser) =>
          (b.cpulseRating || 0) - (a.cpulseRating || 0)
        );
        setUsers(processedUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white">
          🌍 Global Leaderboard
        </h1>
        <p className="text-gray-300 mt-2">
          Ranked by <span className="font-semibold">CP Score</span>
        </p>
      </div>

      {/* ================= LEADERBOARD ================= */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-4 text-sm font-semibold text-gray-200 border-b border-white/10">
          <div className="col-span-2">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-3">Platform</div>
          <div className="col-span-2 text-right">CP Score</div>
        </div>

        {/* Rows */}
        {users.map((u, idx) => (
          <div
            key={`${u.handle}-${u.platform}`}
            className="grid grid-cols-12 px-6 py-4 items-center border-b border-white/5 hover:bg-white/5 transition"
          >
            {/* Rank */}
            <div className="col-span-2 font-bold text-gray-200">
              #{idx + 1}
            </div>

            {/* Handle */}
            <div className="col-span-5 font-medium text-white">
              {u.handle}
            </div>

            {/* Platform badge */}
            <div className="col-span-3">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${u.platform === "codeforces"
                  ? "bg-red-500/20 text-red-400"
                  : u.platform === "codechef"
                    ? "bg-amber-700/20 text-amber-500"
                    : "bg-yellow-500/20 text-yellow-400"
                  }`}
              >
                {u.platform === "codeforces"
                  ? "Codeforces"
                  : u.platform === "codechef"
                    ? "CodeChef"
                    : "LeetCode"}
              </span>
            </div>

            {/* CP Score */}
            <div className="col-span-2 text-right font-extrabold">
              <span className={u.cpulseRating === 0 ? "text-gray-400" : "text-indigo-400"}>
                {u.cpulseRating ?? 0}
              </span>
              {u.cpulseRating === 0 && (
                <span className="text-xs text-gray-500 ml-2">New</span>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!users.length && (
          <div className="p-6 text-center text-gray-400">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
