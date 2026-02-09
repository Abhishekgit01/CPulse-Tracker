import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";

interface ContestEntry {
  contestId: string;
  contestName: string;
  platform: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  date: string;
  color?: string; // CodeChef rating color
}

interface CodeChefProfile {
  displayName: string;
  currentRating: number;
  highestRating: number;
  stars: number;
  starColor: string | null;
}

const PLATFORM_CONFIG: Record<string, { name: string; color: string; chartColor: string; gradient: string }> = {
  codeforces: { name: "Codeforces", color: "text-blue-400", chartColor: "#60a5fa", gradient: "from-blue-500 to-cyan-600" },
  leetcode: { name: "LeetCode", color: "text-amber-400", chartColor: "#fbbf24", gradient: "from-amber-500 to-orange-600" },
  codechef: { name: "CodeChef", color: "text-yellow-400", chartColor: "#facc15", gradient: "from-yellow-600 to-amber-700" },
};

type SortKey = "date" | "rank" | "ratingChange" | "newRating";

export default function ContestHistory({ embedded = false }: { embedded?: boolean }) {
  const { platform: urlPlatform, handle: urlHandle } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [contests, setContests] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(urlPlatform || "");
  const [handle, setHandle] = useState(urlHandle || "");
  const [searchHandle, setSearchHandle] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [codechefProfile, setCodechefProfile] = useState<CodeChefProfile | null>(null);

  // Auto-fill from user's linked profiles
  const profiles = user?.cpProfiles || [];

  useEffect(() => {
    if (urlPlatform && urlHandle) {
      fetchHistory(urlPlatform, urlHandle);
    } else if (searchParams.get("platform") && searchParams.get("handle")) {
      const p = searchParams.get("platform")!;
      const h = searchParams.get("handle")!;
      setSelectedPlatform(p);
      setHandle(h);
      fetchHistory(p, h);
    } else if (profiles.length > 0 && !selectedPlatform) {
      // Default to first linked profile
      const first = profiles[0];
      setSelectedPlatform(first.platform);
      setHandle(first.handle);
      fetchHistory(first.platform, first.handle);
    }
  }, []); // eslint-disable-line

  const fetchHistory = async (platform: string, username: string) => {
    if (!platform || !username) return;
    setLoading(true);
    setError("");
    setSelectedPlatform(platform);
    setHandle(username);
    setCodechefProfile(null);

    try {
      const res = await api.get(`/api/contest-history/${platform}/${username}`);
      if (res.data.success) {
        setContests(res.data.contests);
        if (platform === "codechef" && res.data.profile) {
          setCodechefProfile(res.data.profile);
        }
      } else {
        setError(res.data.error || "Failed to fetch contest history");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch contest history");
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatform && searchHandle.trim()) {
      fetchHistory(selectedPlatform, searchHandle.trim());
    }
  };

  // Sorting
  const sortedContests = [...contests].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "date":
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "rank":
        cmp = a.rank - b.rank;
        break;
      case "ratingChange":
        cmp = a.ratingChange - b.ratingChange;
        break;
      case "newRating":
        cmp = a.newRating - b.newRating;
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  // Stats
  const totalContests = contests.length;
  const bestRank = totalContests > 0 ? Math.min(...contests.map((c) => c.rank)) : 0;
  const bestGain = totalContests > 0 ? Math.max(...contests.map((c) => c.ratingChange)) : 0;
  const worstLoss = totalContests > 0 ? Math.min(...contests.map((c) => c.ratingChange)) : 0;
  const avgChange = totalContests > 0 ? Math.round(contests.reduce((s, c) => s + c.ratingChange, 0) / totalContests) : 0;
  const currentRating = totalContests > 0 ? contests[contests.length - 1].newRating : 0;

  // Chart data (chronological)
  const chartData = [...contests]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((c) => ({
      date: new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rating: c.newRating,
      change: c.ratingChange,
      color: c.color || undefined,
    }));

  const config = PLATFORM_CONFIG[selectedPlatform] || PLATFORM_CONFIG.codeforces;

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={14} className="text-gray-600" />;
    return sortAsc ? <ChevronUp size={14} className="text-indigo-400" /> : <ChevronDown size={14} className="text-indigo-400" />;
  };

  return (
    <div className={embedded ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
      {/* Header - hidden when embedded in ContestCalendar */}
      {!embedded && (
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
            <Trophy className="text-indigo-400" size={40} />
            Contest History
          </h1>
          <p className="text-gray-400 mt-2">
            Track your contest participation and rating progression across platforms
          </p>
        </div>
      )}

      {/* Profile Quick Select + Search */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
        {/* Linked Profiles */}
        {profiles.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-3">Your linked profiles:</p>
            <div className="flex flex-wrap gap-2">
              {profiles.map((p: any) => {
                const pc = PLATFORM_CONFIG[p.platform];
                const isActive = selectedPlatform === p.platform && handle === p.handle;
                return (
                  <button
                    key={`${p.platform}-${p.handle}`}
                    onClick={() => fetchHistory(p.platform, p.handle)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${pc?.gradient || ""} text-white shadow-lg`
                        : "bg-gray-900/50 border border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    {pc?.name || p.platform} - @{p.handle}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Search */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {Object.entries(PLATFORM_CONFIG).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPlatform(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPlatform === key
                    ? `bg-gradient-to-r ${val.gradient} text-white`
                    : "bg-gray-900/50 border border-white/10 text-gray-400 hover:text-gray-200"
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchHandle}
              onChange={(e) => setSearchHandle(e.target.value)}
              placeholder="Enter username..."
              className="flex-1 px-4 py-2 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={!selectedPlatform || !searchHandle.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin text-6xl">&#9881;&#65039;</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && contests.length > 0 && (
        <>
          {/* Active Handle Banner */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-sm font-bold`}>
                {config.name}
              </div>
              <span className="text-white font-semibold text-lg">
                {codechefProfile ? codechefProfile.displayName : `@${handle}`}
              </span>
              {codechefProfile && (
                <>
                  <span className="text-gray-400 text-sm">@{handle}</span>
                  <span
                    className="text-lg font-bold tracking-wide"
                    style={{ color: codechefProfile.starColor || "#facc15" }}
                    title={`${codechefProfile.stars}-star rated`}
                  >
                    {"★".repeat(codechefProfile.stars)}
                  </span>
                </>
              )}
              <span className="text-gray-500 text-sm">({totalContests} contests)</span>
            </div>

            {/* CodeChef Profile Card */}
            {codechefProfile && (
              <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-5 mb-8 flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: (codechefProfile.starColor || "#facc15") + "22", color: codechefProfile.starColor || "#facc15" }}
                  >
                    {codechefProfile.stars}★
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{codechefProfile.displayName}</p>
                    <p className="text-gray-400 text-sm">@{handle}</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10 hidden sm:block" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Current Rating</p>
                  <p className="text-2xl font-bold" style={{ color: codechefProfile.starColor || "#facc15" }}>
                    {codechefProfile.currentRating}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Highest Rating</p>
                  <p className="text-2xl font-bold text-white">
                    {codechefProfile.highestRating}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Contests</p>
                  <p className="text-2xl font-bold text-white">{totalContests}</p>
                </div>
              </div>
            )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contests</p>
              <p className="text-2xl font-bold text-white">{totalContests}</p>
            </div>
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Rating</p>
              <p className="text-2xl font-bold text-white">{currentRating}</p>
            </div>
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Best Rank</p>
              <p className="text-2xl font-bold text-emerald-400">#{bestRank.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Best Gain</p>
              <p className="text-2xl font-bold text-emerald-400">+{bestGain}</p>
            </div>
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Worst Loss</p>
              <p className="text-2xl font-bold text-red-400">{worstLoss}</p>
            </div>
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Change</p>
              <p className={`text-2xl font-bold ${avgChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {avgChange >= 0 ? "+" : ""}{avgChange}
              </p>
            </div>
          </div>

          {/* Rating Chart */}
            {chartData.length > 1 && (
              <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-400" />
                  Rating Progression
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      interval={Math.max(0, Math.floor(chartData.length / 10))}
                    />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "rating") return [value, "Rating"];
                        return [value, "Change"];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke={config.chartColor}
                      strokeWidth={2}
                      dot={
                        selectedPlatform === "codechef" && chartData.length <= 80
                          ? (props: any) => {
                              const { cx, cy, payload } = props;
                              return (
                                <circle
                                  key={`dot-${cx}-${cy}`}
                                  cx={cx}
                                  cy={cy}
                                  r={3}
                                  fill={payload.color || config.chartColor}
                                  stroke={payload.color || config.chartColor}
                                  strokeWidth={1}
                                />
                              );
                            }
                          : { r: chartData.length > 30 ? 0 : 3 }
                      }
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Contest Table */}
          <div className="bg-gray-800/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">All Contests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition"
                      onClick={() => toggleSort("date")}
                    >
                      <span className="flex items-center gap-1">Date <SortIcon col="date" /></span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Contest
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition"
                      onClick={() => toggleSort("rank")}
                    >
                      <span className="flex items-center justify-end gap-1">Rank <SortIcon col="rank" /></span>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition"
                      onClick={() => toggleSort("ratingChange")}
                    >
                      <span className="flex items-center justify-end gap-1">Change <SortIcon col="ratingChange" /></span>
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition"
                      onClick={() => toggleSort("newRating")}
                    >
                      <span className="flex items-center justify-end gap-1">Rating <SortIcon col="newRating" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedContests.map((c, i) => (
                    <tr
                      key={`${c.contestId}-${i}`}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(c.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium max-w-[300px] truncate">
                        {c.contestName}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-300">
                        #{c.rank.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            c.ratingChange > 0
                              ? "bg-emerald-500/10 text-emerald-400"
                              : c.ratingChange < 0
                              ? "bg-red-500/10 text-red-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {c.ratingChange > 0 ? (
                            <TrendingUp size={12} />
                          ) : c.ratingChange < 0 ? (
                            <TrendingDown size={12} />
                          ) : null}
                          {c.ratingChange > 0 ? "+" : ""}
                          {c.ratingChange}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold"
                        style={c.color ? { color: c.color } : undefined}
                      >
                        <span className={c.color ? "" : "text-white"}>{c.newRating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && contests.length === 0 && handle && (
        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-white/5">
          <Award size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400">No contest history found</h3>
          <p className="text-gray-500 mt-2">
            This user hasn't participated in any rated contests yet.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !error && contests.length === 0 && !handle && (
        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-white/5">
          <Search size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400">Search for contest history</h3>
          <p className="text-gray-500 mt-2">
            Select a platform and enter a username to view contest participation history.
          </p>
        </div>
      )}
    </div>
  );
}
