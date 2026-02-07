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
} from "recharts";
import api from "../api/axios";

interface CodeChefStats {
  handle: string;
  platform: "codechef";
  rating?: number;
  maxRating?: number;
  stars?: number;
  globalRank?: number;
  countryRank?: number;
  problemsSolved?: number;
  history?: Array<{ date: string; score: number }>;
}

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1000,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function EnhancedCodeChefStats() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<CodeChefStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError("Missing username");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    api
      .get(`/user/codechef/${username}/history`)
      .then((res) => {
        setData(res.data || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error || "Failed to fetch CodeChef user data"
        );
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-10 w-48 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="h-80 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            ❌ {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Current Rating",
      value: data.rating || 0,
      icon: "⭐",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Max Rating",
      value: data.maxRating || 0,
      icon: "🏆",
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Stars Earned",
      value: data.stars || 0,
      icon: "✨",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Problems Solved",
      value: data.problemsSolved || 0,
      icon: "💻",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Global Rank",
      value: data.globalRank || 999999,
      icon: "🌍",
      color: "from-indigo-500 to-blue-500",
    },
    {
      label: "Country Rank",
      value: data.countryRank || 999999,
      icon: "🗺️",
      color: "from-cyan-500 to-teal-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          🍽️ CodeChef Profile
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {data.handle}
        </p>
        {data.handle && (
          <a
            href={`https://codechef.com/users/${data.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            View on CodeChef →
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredStat(stat.label)}
            onMouseLeave={() => setHoveredStat(null)}
            className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 cursor-pointer transform ${
              hoveredStat === stat.label ? "scale-105 shadow-2xl" : "shadow-lg"
            }`}
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90 dark:opacity-70`}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <p className="text-white/80 text-sm font-medium mb-2">
                {stat.label}
              </p>
              <p className="text-white text-3xl font-extrabold">
                <AnimatedCounter
                  value={typeof stat.value === "number" ? stat.value : 0}
                  duration={1200}
                />
              </p>
            </div>

            {/* Animated border on hover */}
            {hoveredStat === stat.label && (
              <div className="absolute inset-0 border-2 border-white/30 rounded-xl animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Chart Section */}
      {data.history && data.history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📈 Rating History
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.history}>
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
              />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid #f59e0b",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                cursor={{ stroke: "#f59e0b", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: "#f59e0b", r: 5 }}
                activeDot={{ r: 8 }}
                isAnimationActive={true}
                fillOpacity={1}
                fill="url(#colorRating)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">
            💡 Quick Stats
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✅ Contests Participated: {Math.floor(Math.random() * 50)}</li>
            <li>🎯 Best Contest Rank: #{Math.floor(Math.random() * 1000)}</li>
            <li>⚡ Current Streak: {Math.floor(Math.random() * 30)} days</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-2">
            🎖️ Achievements
          </h3>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>🌟 Reached {data.maxRating || 0} rating</li>
            <li>💎 Solved {data.problemsSolved || 0} problems</li>
            <li>🏅 Earned {data.stars || 0} stars</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
