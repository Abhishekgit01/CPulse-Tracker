import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../api/axios";

interface CodeChefStats {
  handle: string;
  platform: "codechef";
  rating: number;
  maxRating: number;
  stars: number;
  globalRank: number;
  countryRank: number;
  problemsSolved: number;
  history: Array<{ date: string; score: number }>;
}

export default function CodeChefStats() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<CodeChefStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) {
      setError("Missing username");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    api
      .get(`/api/user/codechef/${username}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to fetch CodeChef user data");
        setLoading(false);
      });
  }, [username]);

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded" />
          ))}
        </div>
        <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  /* ===================== ERROR ===================== */
  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-6 rounded-xl text-center">
        <h2 className="text-lg font-semibold mb-2">Unable to Load Profile</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const ratingChange = data.rating - data.maxRating;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          🍳 {data.handle} - CodeChef Profile
        </h1>
        <p className="text-gray-400">Competitive Programming Statistics</p>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rating */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-blue-100 mb-2">Rating</div>
          <div className="text-3xl font-bold">{data.rating}</div>
          <div className={`text-xs mt-2 ${ratingChange >= 0 ? "text-green-200" : "text-red-200"}`}>
            {ratingChange >= 0 ? "+" : ""}{ratingChange}
          </div>
        </div>

        {/* Max Rating */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-purple-100 mb-2">
            Max Rating
          </div>
          <div className="text-3xl font-bold">{data.maxRating}</div>
        </div>

        {/* Stars */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-yellow-100 mb-2">Stars</div>
          <div className="text-3xl font-bold">{"⭐".repeat(data.stars)}</div>
          <div className="text-xs mt-2">{data.stars} Star Rating</div>
        </div>

        {/* Problems Solved */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-green-100 mb-2">
            Problems Solved
          </div>
          <div className="text-3xl font-bold">{data.problemsSolved}</div>
        </div>

        {/* Global Rank */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-indigo-100 mb-2">
            Global Rank
          </div>
          <div className="text-3xl font-bold">
            {data.globalRank > 0 ? `#${data.globalRank}` : "N/A"}
          </div>
        </div>

        {/* Country Rank */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-orange-100 mb-2">
            Country Rank
          </div>
          <div className="text-3xl font-bold">
            {data.countryRank > 0 ? `#${data.countryRank}` : "N/A"}
          </div>
        </div>

        {/* Current Level */}
        <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-pink-100 mb-2">Level</div>
          <div className="text-3xl font-bold">
            {getLevelFromRating(data.rating)}
          </div>
        </div>

        {/* Rank Category */}
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 p-6 rounded-xl text-white shadow-lg">
          <div className="text-sm font-semibold text-cyan-100 mb-2">
            Category
          </div>
          <div className="text-2xl font-bold">{getRankCategory(data.rating)}</div>
        </div>
      </div>

      {/* ================= RATING HISTORY CHART ================= */}
      {data.history && data.history.length > 0 && (
        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Rating History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: "12px" }} />
              <YAxis stroke="#888" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #4b5563",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                name="Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ================= INFO BOX ================= */}
      <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <span className="font-semibold text-white">Handle:</span> {data.handle}
          </div>
          <div>
            <span className="font-semibold text-white">Platform:</span> CodeChef
          </div>
          <div>
            <span className="font-semibold text-white">Profile URL:</span>{" "}
            <a
              href={`https://www.codechef.com/users/${data.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              View on CodeChef
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */

function getLevelFromRating(rating: number): string {
  if (rating < 800) return "Beginner";
  if (rating < 1400) return "Junior";
  if (rating < 1800) return "Expert";
  if (rating < 2200) return "Challenger";
  return "Master";
}

function getRankCategory(rating: number): string {
  if (rating < 800) return "🥉 Bronze";
  if (rating < 1400) return "🥈 Silver";
  if (rating < 1800) return "🥇 Gold";
  if (rating < 2200) return "💎 Platinum";
  return "👑 Master";
}
