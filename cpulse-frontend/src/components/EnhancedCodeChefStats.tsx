import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Globe,
  MapPin,
  Hash,
  Calendar,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Award,
  Target,
  Zap,
  BarChart3,
  User,
  Clock,
} from "lucide-react";
import api from "../api/axios";

// ─── Types ───────────────────────────────────────────────────────

interface ProfileData {
  handle: string;
  platform: string;
  rating: number;
  maxRating: number;
  stars: number;
  globalRank: number;
  countryRank: number;
  problemsSolved: number;
  country: string;
  avatar: string;
  division: string;
  title: string;
  cpulseRating: number;
}

interface ContestEntry {
  contestId: string;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  date: string;
  color?: string;
}

interface ContestProfile {
  displayName: string;
  currentRating: number;
  highestRating: number;
  stars: number;
  starColor: string | null;
}

type SortKey = "date" | "rank" | "ratingChange" | "newRating";

// ─── Helpers ─────────────────────────────────────────────────────

function getStarColor(stars: number): string {
  const colors: Record<number, string> = {
    1: "#666666",
    2: "#1E7D22",
    3: "#3366CC",
    4: "#684273",
    5: "#FFBF00",
    6: "#FF7F00",
    7: "#D0011B",
  };
  return colors[stars] || "#666666";
}

function getTierName(stars: number): string {
  const tiers: Record<number, string> = {
    1: "Beginner",
    2: "Advanced Beginner",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
    6: "Master",
    7: "Grandmaster",
  };
  return tiers[stars] || "Unrated";
}

function getRatingBand(rating: number): { label: string; color: string; bg: string } {
  if (rating >= 2500) return { label: "7-Star", color: "#D0011B", bg: "bg-red-500/10" };
  if (rating >= 2200) return { label: "6-Star", color: "#FF7F00", bg: "bg-orange-500/10" };
  if (rating >= 2000) return { label: "5-Star", color: "#FFBF00", bg: "bg-yellow-500/10" };
  if (rating >= 1800) return { label: "4-Star", color: "#684273", bg: "bg-purple-500/10" };
  if (rating >= 1600) return { label: "3-Star", color: "#3366CC", bg: "bg-blue-500/10" };
  if (rating >= 1400) return { label: "2-Star", color: "#1E7D22", bg: "bg-green-500/10" };
  return { label: "1-Star", color: "#666666", bg: "bg-gray-500/10" };
}

// ─── Component ───────────────────────────────────────────────────

export default function EnhancedCodeChefStats() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [contestProfile, setContestProfile] = useState<ContestProfile | null>(null);
  const [contests, setContests] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "contests">("overview");

  useEffect(() => {
    if (!username) {
      setError("Missing username");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    Promise.allSettled([
      api.get(`/api/metrics/codechef/${username}`),
      api.get(`/api/contest-history/codechef/${username}`),
    ]).then(([metricsResult, historyResult]) => {
      if (metricsResult.status === "fulfilled") {
        setProfile(metricsResult.value.data);
      }
      if (historyResult.status === "fulfilled" && historyResult.value.data.success) {
        setContests(historyResult.value.data.contests || []);
        if (historyResult.value.data.profile) {
          setContestProfile(historyResult.value.data.profile);
        }
      }
      if (metricsResult.status === "rejected" && historyResult.status === "rejected") {
        setError("Failed to fetch CodeChef data. User may not exist.");
      }
      setLoading(false);
    });
  }, [username]);

  // ─── Derived data ────────────────────────────────────────────

  const starColor = contestProfile?.starColor || (profile ? getStarColor(profile.stars) : "#666666");
  const displayName = contestProfile?.displayName || profile?.handle || username || "";
  const rating = contestProfile?.currentRating || profile?.rating || 0;
  const maxRating = contestProfile?.highestRating || profile?.maxRating || 0;
  const stars = contestProfile?.stars || profile?.stars || 0;
  const tier = getTierName(stars);
  const ratingBand = getRatingBand(rating);

  // Contest stats
  const totalContests = contests.length;
  const bestRank = totalContests > 0 ? Math.min(...contests.map((c) => c.rank)) : 0;
  const bestGain = totalContests > 0 ? Math.max(...contests.map((c) => c.ratingChange)) : 0;
  const worstLoss = totalContests > 0 ? Math.min(...contests.map((c) => c.ratingChange)) : 0;
  const positiveContests = contests.filter((c) => c.ratingChange > 0).length;
  const negativeContests = contests.filter((c) => c.ratingChange < 0).length;
  const winRate = totalContests > 1 ? Math.round((positiveContests / (totalContests - 1)) * 100) : 0;

  // Current streak
  let currentStreak = 0;
  let streakType: "positive" | "negative" | "none" = "none";
  if (totalContests > 1) {
    const reversed = [...contests].reverse();
    streakType = reversed[0].ratingChange >= 0 ? "positive" : "negative";
    for (const c of reversed) {
      if ((streakType === "positive" && c.ratingChange >= 0) || (streakType === "negative" && c.ratingChange < 0)) {
        currentStreak++;
      } else break;
    }
  }

  // Chart data (chronological)
  const chartData = [...contests]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((c) => ({
      date: new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
      rating: c.newRating,
      change: c.ratingChange,
      rank: c.rank,
      name: c.contestName,
      color: c.color || starColor,
    }));

  // Rating change distribution for bar chart
  const changeDistribution = contests
    .filter((c) => c.ratingChange !== 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((c) => ({
      name: c.contestName.length > 20 ? c.contestName.substring(0, 20) + "..." : c.contestName,
      change: c.ratingChange,
      fill: c.ratingChange > 0 ? "#10b981" : "#ef4444",
    }));

  // Sorting
  const sortedContests = [...contests].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "date": cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
      case "rank": cmp = a.rank - b.rank; break;
      case "ratingChange": cmp = a.ratingChange - b.ratingChange; break;
      case "newRating": cmp = a.newRating - b.newRating; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={14} className="text-gray-600" />;
    return sortAsc ? <ChevronUp size={14} className="text-amber-400" /> : <ChevronDown size={14} className="text-amber-400" />;
  };

  // ─── Loading ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skeleton header */}
        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-700 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-5 w-32 bg-gray-700/60 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-700/40 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-800/50 border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-800/50 border border-white/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Target className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">User not found</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile && contests.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <User size={64} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg">No data available for this user</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ══════════ PROFILE HEADER ══════════ */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-8">
        {/* Top accent bar */}
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${starColor}, ${starColor}88, transparent)` }} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-gray-900"
                style={{ borderColor: starColor }}
              >
                {profile?.avatar && !profile.avatar.includes("user_default") ? (
                  <img
                    src={profile.avatar}
                    alt={username}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-4xl font-bold" style={{ color: starColor }}>
                    {(displayName || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              {/* Star badge */}
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: starColor }}
              >
                {stars}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-white truncate">{displayName}</h1>
                <span
                  className="text-lg font-bold tracking-wide"
                  style={{ color: starColor }}
                  title={`${stars}-star rated`}
                >
                  {"★".repeat(stars)}
                </span>
              </div>
              <p className="text-gray-400 mt-1">@{username}</p>

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{ color: starColor, borderColor: starColor + "44", backgroundColor: starColor + "15" }}
                >
                  {tier}
                </span>
                {profile?.division && (
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <BarChart3 size={14} /> {profile.division}
                  </span>
                )}
                {profile?.country && profile.country !== "Unknown" && (
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin size={14} /> {profile.country}
                  </span>
                )}
              </div>
            </div>

            {/* Rating badge + link */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Rating</p>
                <p className="text-4xl font-black" style={{ color: starColor }}>{rating}</p>
              </div>
              <a
                href={`https://www.codechef.com/users/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500/40"
              >
                <ExternalLink size={14} /> View on CodeChef
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ STATS GRID ══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-8">
        {[
          { label: "Rating", value: rating, icon: <Star size={18} />, color: starColor },
          { label: "Max Rating", value: maxRating, icon: <Trophy size={18} />, color: "#fbbf24" },
          { label: "Problems", value: profile?.problemsSolved || 0, icon: <Target size={18} />, color: "#10b981" },
          { label: "Contests", value: totalContests, icon: <Calendar size={18} />, color: "#8b5cf6" },
          { label: "Global Rank", value: profile?.globalRank || 0, icon: <Globe size={18} />, color: "#60a5fa", prefix: "#" },
          { label: "Country Rank", value: profile?.countryRank || 0, icon: <MapPin size={18} />, color: "#06b6d4", prefix: "#" },
          { label: "Best Rank", value: bestRank, icon: <Award size={18} />, color: "#f472b6", prefix: "#" },
          { label: "CPulse", value: profile?.cpulseRating || 0, icon: <Zap size={18} />, color: "#a78bfa" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-800/50 border border-white/10 rounded-xl p-4 hover:border-white/20 transition">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
            <p className="text-xl font-bold text-white">
              {stat.prefix || ""}{(stat.value || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ══════════ TAB SWITCHER ══════════ */}
      <div className="flex gap-2 mb-6">
        {(["overview", "contests"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-amber-600/15 border border-amber-500/30 text-amber-300"
                : "bg-gray-800/30 border border-white/5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            {tab === "overview" ? "Overview" : `Contests (${totalContests})`}
          </button>
        ))}
      </div>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {activeTab === "overview" && (
        <>
          {/* Rating Progression Chart */}
          {chartData.length > 0 && (
            <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} style={{ color: starColor }} />
                Rating Progression
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ccRatingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={starColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={starColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(chartData.length / 8))} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                          <p className="text-white font-semibold text-sm mb-1">{d.name}</p>
                          <p className="text-gray-400 text-xs mb-2">{d.date}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-bold" style={{ color: d.color }}>
                              Rating: {d.rating}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.change > 0 ? "bg-emerald-500/10 text-emerald-400" : d.change < 0 ? "bg-red-500/10 text-red-400" : "text-gray-400"}`}>
                              {d.change > 0 ? "+" : ""}{d.change}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">Rank: #{d.rank?.toLocaleString()}</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke={starColor}
                    strokeWidth={2.5}
                    fill="url(#ccRatingGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={chartData.length > 50 ? 2 : 4}
                          fill={payload.color || starColor}
                          stroke={payload.color || starColor}
                          strokeWidth={1}
                        />
                      );
                    }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance Summary Cards */}
          {totalContests > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Win Rate */}
              <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Performance</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-white">{winRate}%</p>
                  <p className="text-gray-400 text-sm pb-1">win rate</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">{positiveContests}W</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-red-400 text-sm font-medium">{negativeContests}L</span>
                  </div>
                </div>
                {/* Mini bar */}
                <div className="mt-3 h-2 rounded-full bg-gray-700 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${winRate}%` }} />
                  <div className="bg-red-500 h-full transition-all" style={{ width: `${100 - winRate}%` }} />
                </div>
              </div>

              {/* Best / Worst */}
              <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Rating Swings</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Best Gain</span>
                    <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                      <TrendingUp size={16} /> +{bestGain}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Worst Loss</span>
                    <span className="text-red-400 font-bold text-lg flex items-center gap-1">
                      <TrendingDown size={16} /> {worstLoss}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Rating Range</span>
                    <span className="text-white font-medium">
                      {Math.min(...contests.map((c) => c.newRating))} - {maxRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Current Streak</p>
                <div className="flex items-end gap-3">
                  <p className={`text-4xl font-black ${streakType === "positive" ? "text-emerald-400" : streakType === "negative" ? "text-red-400" : "text-gray-400"}`}>
                    {currentStreak}
                  </p>
                  <p className="text-gray-400 text-sm pb-1">
                    {streakType === "positive" ? "gains in a row" : streakType === "negative" ? "losses in a row" : ""}
                  </p>
                </div>
                {/* Streak visualization */}
                <div className="flex gap-1 mt-4">
                  {[...contests].slice(-10).map((c, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-6 rounded-sm ${c.ratingChange > 0 ? "bg-emerald-500/60" : c.ratingChange < 0 ? "bg-red-500/60" : "bg-gray-600"}`}
                      title={`${c.contestName}: ${c.ratingChange > 0 ? "+" : ""}${c.ratingChange}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Last {Math.min(10, contests.length)} contests</p>
              </div>
            </div>
          )}

          {/* Rating Change Bar Chart */}
          {changeDistribution.length > 1 && (
            <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-amber-400" />
                Rating Changes by Contest
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={changeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(changeDistribution.length / 6))} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [`${value > 0 ? "+" : ""}${value}`, "Change"]}
                  />
                  <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                    {changeDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rating Milestones / Journey */}
          {totalContests > 0 && (
            <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                Journey Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
                <div className="space-y-4">
                  {/* First contest */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center z-10 shrink-0">
                      <Zap size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">First Contest</p>
                      <p className="text-gray-500 text-xs">
                        {contests[0].contestName} - Rated {contests[0].newRating}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {new Date(contests[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Best rank */}
                  {totalContests > 1 && (() => {
                    const best = contests.reduce((prev, curr) => (curr.rank < prev.rank ? curr : prev));
                    return (
                      <div className="flex items-start gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center z-10 shrink-0">
                          <Trophy size={14} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Best Performance</p>
                          <p className="text-gray-500 text-xs">
                            Rank #{best.rank.toLocaleString()} in {best.contestName}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Max rating achieved */}
                  {totalContests > 1 && (() => {
                    const peak = contests.reduce((prev, curr) => (curr.newRating > prev.newRating ? curr : prev));
                    return (
                      <div className="flex items-start gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center z-10 shrink-0">
                          <Star size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Peak Rating: {peak.newRating}</p>
                          <p className="text-gray-500 text-xs">
                            Achieved in {peak.contestName}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Latest contest */}
                  {totalContests > 1 && (
                    <div className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center z-10 shrink-0">
                        <Calendar size={14} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Latest Contest</p>
                        <p className="text-gray-500 text-xs">
                          {contests[contests.length - 1].contestName} - Rating {contests[contests.length - 1].newRating}{" "}
                          <span className={contests[contests.length - 1].ratingChange >= 0 ? "text-emerald-400" : "text-red-400"}>
                            ({contests[contests.length - 1].ratingChange > 0 ? "+" : ""}
                            {contests[contests.length - 1].ratingChange})
                          </span>
                        </p>
                        <p className="text-gray-600 text-xs">
                          {new Date(contests[contests.length - 1].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/contest-history/codechef/${username}`}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600/20 transition flex items-center gap-2"
            >
              <Hash size={14} /> Full Contest History
            </Link>
            <Link
              to={`/growth/codechef/${username}`}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition flex items-center gap-2"
            >
              <TrendingUp size={14} /> Growth Analysis
            </Link>
          </div>
        </>
      )}

      {/* ══════════ CONTESTS TAB ══════════ */}
      {activeTab === "contests" && (
        <>
          {contests.length === 0 ? (
            <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-white/5">
              <Calendar size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">No contests found</h3>
              <p className="text-gray-500 mt-2">This user hasn't participated in rated contests yet.</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar size={20} style={{ color: starColor }} />
                  All Rated Contests
                </h2>
                <span className="text-gray-500 text-sm">{totalContests} contests</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition" onClick={() => toggleSort("date")}>
                        <span className="flex items-center gap-1">Date <SortIcon col="date" /></span>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contest</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition" onClick={() => toggleSort("rank")}>
                        <span className="flex items-center justify-end gap-1">Rank <SortIcon col="rank" /></span>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition" onClick={() => toggleSort("ratingChange")}>
                        <span className="flex items-center justify-end gap-1">Change <SortIcon col="ratingChange" /></span>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition" onClick={() => toggleSort("newRating")}>
                        <span className="flex items-center justify-end gap-1">Rating <SortIcon col="newRating" /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedContests.map((c, i) => (
                      <tr key={`${c.contestId}-${i}`} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium max-w-[300px] truncate">
                          {c.contestName}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-300">#{c.rank.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            c.ratingChange > 0 ? "bg-emerald-500/10 text-emerald-400" : c.ratingChange < 0 ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400"
                          }`}>
                            {c.ratingChange > 0 ? <TrendingUp size={12} /> : c.ratingChange < 0 ? <TrendingDown size={12} /> : null}
                            {c.ratingChange > 0 ? "+" : ""}{c.ratingChange}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold" style={c.color ? { color: c.color } : undefined}>
                          <span className={c.color ? "" : "text-white"}>{c.newRating}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
