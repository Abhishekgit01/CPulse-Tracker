import { useEffect, useState } from "react";
import axios from "../api/axios";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface User {
  handle: string;
  platform: "codeforces" | "codechef" | "leetcode";
  cpulseRating: number;
  rating?: number;
  updatedAt: string;
}

interface DashboardStats {
  totalUsers: number;
  averageCPScore: number;
  topUser?: User;
  platformStats: Array<{
    platform: string;
    count: number;
    avgRating: number;
  }>;
  recentUsers: User[];
}

const PLATFORM_COLORS = {
  codeforces: "#ef4444",
  codechef: "#b45309",
  leetcode: "#eab308",
};

export default function StatsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformData, setPlatformData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/leaderboard");
        const users: User[] = res.data;

        if (users.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate platform distribution
        const platformMap = new Map<string, { count: number; ratings: number[] }>();
        users.forEach((user) => {
          if (!platformMap.has(user.platform)) {
            platformMap.set(user.platform, { count: 0, ratings: [] });
          }
          const data = platformMap.get(user.platform)!;
          data.count++;
          data.ratings.push(user.cpulseRating || 0);
        });

        const platformStats = Array.from(platformMap.entries()).map(([platform, data]) => ({
          platform,
          count: data.count,
          avgRating: Math.round(data.ratings.reduce((a, b) => a + b, 0) / data.count),
        }));

        const pieData = platformStats.map((p) => ({
          name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
          value: p.count,
          platform: p.platform,
        }));

        const avgCPScore = Math.round(
          users.reduce((sum, u) => sum + (u.cpulseRating || 0), 0) / users.length
        );

        // Get recently updated users
        const recentUsers = [...users]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);

        setStats({
          totalUsers: users.length,
          averageCPScore: avgCPScore,
          topUser: users[0],
          platformStats,
          recentUsers,
        });

        setPlatformData(pieData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="h-96 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No users found. Add some users first!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          📊 Performance Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Real-time insights from the CPulse community
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">Total Users</p>
              <p className="text-4xl font-extrabold">{stats.totalUsers}</p>
            </div>
            <div className="text-5xl opacity-30">👥</div>
          </div>
        </div>

        {/* Average CP Score */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold mb-1">Avg CP Score</p>
              <p className="text-4xl font-extrabold">{stats.averageCPScore}</p>
            </div>
            <div className="text-5xl opacity-30">📈</div>
          </div>
        </div>

        {/* Top User Rating */}
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-semibold mb-1">Top Score</p>
              <p className="text-4xl font-extrabold">{stats.topUser?.cpulseRating || 0}</p>
              <p className="text-xs text-amber-100 mt-1 truncate">{stats.topUser?.handle}</p>
            </div>
            <div className="text-5xl opacity-30">🏆</div>
          </div>
        </div>

        {/* Codeforces Count */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-semibold mb-1">Platforms</p>
              <p className="text-4xl font-extrabold">{stats.platformStats.length}</p>
              <p className="text-xs text-red-100 mt-1">active platforms</p>
            </div>
            <div className="text-5xl opacity-30">⚡</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Platform Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            📱 Platform Distribution
          </h2>
          {platformData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PLATFORM_COLORS[entry.platform as keyof typeof PLATFORM_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Statistics Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            📊 Average Ratings by Platform
          </h2>
          {stats.platformStats.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.platformStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                <XAxis
                  dataKey="platform"
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
                    border: "1px solid #fff",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="avgRating" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recently Updated Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          🔥 Recently Active Users
        </h2>

        <div className="space-y-3">
          {stats.recentUsers.map((user, idx) => {
            const daysSince = Math.floor(
              (Date.now() - new Date(user.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            const platformIcon =
              user.platform === "codeforces"
                ? "⚡"
                : user.platform === "codechef"
                  ? "🍽️"
                  : "💻";

            return (
              <div
                key={`${user.handle}-${user.platform}`}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl">{platformIcon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {user.handle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {daysSince} {daysSince === 1 ? "day" : "days"} ago
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {user.cpulseRating}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.platform}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {stats.platformStats.map((stat) => (
          <div
            key={stat.platform}
            className={`rounded-xl p-6 border-l-4 ${
              stat.platform === "codeforces"
                ? "bg-red-50 dark:bg-red-900/10 border-red-500"
                : stat.platform === "codechef"
                  ? "bg-amber-50 dark:bg-amber-900/10 border-amber-600"
                  : "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500"
            }`}
          >
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 capitalize text-lg">
              {stat.platform === "codeforces"
                ? "⚡ Codeforces"
                : stat.platform === "codechef"
                  ? "🍽️ CodeChef"
                  : "💻 LeetCode"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {stat.count}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {stat.avgRating}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
