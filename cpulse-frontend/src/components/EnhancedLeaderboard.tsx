import { useEffect, useState } from "react";
import axios from "axios";

interface LeaderboardUser {
  handle: string;
  platform: "codeforces" | "leetcode" | "codechef";
  cpulseRating?: number;
  rating?: number;
}

type SortField = "rank" | "handle" | "platform" | "rating";
type SortDirection = "asc" | "desc";

export default function EnhancedLeaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "codeforces" | "leetcode" | "codechef">("all");
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get("/leaderboard")
      .then((res) => {
        // Assign default CP score of 0 to accounts without one
        const processedUsers = (res.data || []).map((user: LeaderboardUser) => ({
          ...user,
          cpulseRating: user.cpulseRating ?? user.rating ?? 0,
        }));
        setUsers(processedUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter((u) => u.platform === platformFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any = 0,
        bVal: any = 0;

      switch (sortField) {
        case "rating":
          aVal = a.cpulseRating || 0;
          bVal = b.cpulseRating || 0;
          break;
        case "handle":
          aVal = a.handle.toLowerCase();
          bVal = b.handle.toLowerCase();
          break;
        case "platform":
          aVal = a.platform;
          bVal = b.platform;
          break;
        default:
          aVal = users.indexOf(a);
          bVal = users.indexOf(b);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, platformFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return " ↕️";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-8 w-64 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🌍 Global Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredUsers.length} users • Ranked by CP Score
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Platform Filter */}
        <div className="flex gap-2">
          {(["all", "codeforces", "codechef", "leetcode"] as const).map(
            (platform) => (
              <button
                key={platform}
                onClick={() =>
                  setPlatformFilter(
                    platform as "all" | "codeforces" | "leetcode" | "codechef"
                  )
                }
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  platformFilter === platform
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {platform === "all"
                  ? "All Platforms"
                  : platform === "codeforces"
                    ? "Codeforces"
                    : platform === "codechef"
                      ? "CodeChef"
                      : "LeetCode"}
              </button>
            )
          )}
        </div>
      </div>

      {/* ================= LEADERBOARD TABLE ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">
            <button
              onClick={() => toggleSort("handle")}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              User {getSortIndicator("handle")}
            </button>
          </div>
          <div className="col-span-3">
            <button
              onClick={() => toggleSort("platform")}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Platform {getSortIndicator("platform")}
            </button>
          </div>
          <div className="col-span-3 text-right">
            <button
              onClick={() => toggleSort("rating")}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              CP Score {getSortIndicator("rating")}
            </button>
          </div>
        </div>

        {/* Rows */}
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u, idx) => {
            const rating = u.cpulseRating ?? 0;
            return (
              <div
                key={`${u.handle}-${u.platform}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`grid grid-cols-12 px-6 py-4 items-center border-b border-gray-100 dark:border-gray-700 transition-all duration-200 ${
                  hoveredIndex === idx
                    ? "bg-blue-50 dark:bg-gray-700 shadow-md translate-x-1"
                    : "hover:bg-gray-50 dark:hover:bg-gray-750"
                }`}
              >
                {/* Rank with medal */}
                <div className="col-span-1 font-bold">
                  {idx < 3 ? (
                    <span className="text-lg">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Handle */}
                <div className="col-span-5 font-semibold text-gray-900 dark:text-gray-100">
                  {u.handle}
                </div>

                {/* Platform badge */}
                <div className="col-span-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full transition-transform ${
                      hoveredIndex === idx ? "scale-110" : ""
                    } ${
                      u.platform === "codeforces"
                        ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                        : u.platform === "codechef"
                          ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
                    }`}
                  >
                    {u.platform === "codeforces"
                      ? "⚡ Codeforces"
                      : u.platform === "codechef"
                        ? "🍽️ CodeChef"
                        : "💻 LeetCode"}
                  </span>
                </div>

                {/* CP Score with status */}
                <div className="col-span-3 text-right">
                  <span className={`text-2xl font-extrabold ${
                    rating === 0 
                      ? "text-gray-400" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  }`}>
                    {rating.toLocaleString()}
                  </span>
                  {rating === 0 && (
                    <span className="text-xs text-gray-500 ml-2">New</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-12 py-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">No users found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {filteredUsers.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        </div>
        <div className="bg-green-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {filteredUsers.length > 0
              ? Math.max(...filteredUsers.map((u) => u.cpulseRating || 0))
              : 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Highest Score
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {filteredUsers.length > 0
              ? Math.round(
                  filteredUsers.reduce((sum, u) => sum + (u.cpulseRating || 0), 0) /
                    filteredUsers.length
                )
              : 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average Score
          </p>
        </div>
      </div>
    </div>
  );
}
