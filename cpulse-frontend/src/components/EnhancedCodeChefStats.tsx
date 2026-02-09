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
} from "recharts";
import {
  Trophy,
  Star,
  Globe,
  Flag,
  Code,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Flame,
  ExternalLink,
  ArrowLeft,
  Hash,
  Target,
  Activity,
  BarChart2,
} from "lucide-react";
import api from "../api/axios";

/* ===================== TYPES ===================== */

interface ContestEntry {
  date: string;
  score: number;
  contestCode?: string;
  contestName?: string;
  rank?: number;
  ratingChange?: number;
}

interface HeatMapEntry {
  date: string;
  count: number;
}

interface CodeChefData {
  handle: string;
  platform: "codechef";
  rating: number;
  maxRating: number;
  stars: number;
  globalRank: number;
  countryRank: number;
  problemsSolved: number;
  country: string;
  avatar?: string;
  division: string;
  title: string;
  realName: string;
  institution: string;
  cpulseRating: number;
  history: Array<{ date: string; score: number }>;
  contestHistory: ContestEntry[];
  contestsAttended: number;
  heatMap: HeatMapEntry[];
  totalActiveDays: number;
  streak: number;
}

/* ===================== HELPERS ===================== */

function getStarColor(stars: number): string {
  if (stars >= 7) return "from-red-500 to-red-600";
  if (stars >= 6) return "from-orange-400 to-orange-500";
  if (stars >= 5) return "from-purple-500 to-purple-600";
  if (stars >= 4) return "from-blue-500 to-blue-600";
  if (stars >= 3) return "from-green-500 to-green-600";
  if (stars >= 2) return "from-teal-500 to-teal-600";
  return "from-gray-500 to-gray-600";
}

function getRatingColor(rating: number): string {
  if (rating >= 2500) return "text-red-500";
  if (rating >= 2200) return "text-orange-400";
  if (rating >= 2000) return "text-purple-500";
  if (rating >= 1800) return "text-blue-500";
  if (rating >= 1600) return "text-green-500";
  if (rating >= 1400) return "text-teal-500";
  return "text-gray-400";
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* ===================== ANIMATED COUNTER ===================== */

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = value / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

/* ===================== STAT CARD ===================== */

function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gray-800/50 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-20`}>
            {icon}
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
      </div>
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */

export default function EnhancedCodeChefStats() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<CodeChefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "contests" | "activity">("overview");

  useEffect(() => {
    if (!username) { setError("Missing username"); setLoading(false); return; }
    setLoading(true);
    setError("");
    api.get(`/api/metrics/codechef/${username}`)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to fetch CodeChef data");
        setLoading(false);
      });
  }, [username]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-800 rounded-2xl" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-64 bg-gray-800 rounded-lg" />
              <div className="h-4 w-48 bg-gray-800 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-800 rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Profile</h2>
          <p className="text-gray-400 text-sm mb-6">{error || "No data available"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ratingDiff = data.rating - data.maxRating;
  const lastContest = data.contestHistory?.length > 0 ? data.contestHistory[data.contestHistory.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* =================== BACK LINK =================== */}
        <Link to="/search" className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        {/* =================== PROFILE HEADER =================== */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt={data.handle}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/30 shadow-lg shadow-amber-500/10"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-bold text-white">
                  {data.handle[0]?.toUpperCase()}
                </div>
              )}
              {/* Star badge */}
              <div className={`absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-gradient-to-r ${getStarColor(data.stars)} text-white text-xs font-bold shadow-lg`}>
                {data.stars} <Star className="w-3 h-3 inline -mt-0.5" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold truncate">{data.handle}</h1>
                {data.division && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/20">
                    {data.division}
                  </span>
                )}
              </div>
              {data.realName && (
                <p className="text-gray-400 mt-1">{data.realName}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                {data.country && data.country !== "Unknown" && (
                  <span className="flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" /> {data.country}
                  </span>
                )}
                {data.institution && (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> {data.institution}
                  </span>
                )}
                {data.contestsAttended > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {data.contestsAttended} contests
                  </span>
                )}
              </div>
            </div>

            {/* Rating badge + external link */}
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Rating</div>
                <div className={`text-4xl font-black ${getRatingColor(data.rating)}`}>
                  {data.rating}
                </div>
                {data.maxRating > 0 && data.maxRating !== data.rating && (
                  <div className="text-xs text-gray-500 mt-1">
                    Max: <span className={getRatingColor(data.maxRating)}>{data.maxRating}</span>
                    {ratingDiff !== 0 && (
                      <span className={ratingDiff >= 0 ? "text-green-400 ml-1" : "text-red-400 ml-1"}>
                        ({ratingDiff >= 0 ? "+" : ""}{ratingDiff})
                      </span>
                    )}
                  </div>
                )}
              </div>
              <a
                href={`https://www.codechef.com/users/${data.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition"
              >
                View on CodeChef <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* =================== STAT CARDS =================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Star className="w-5 h-5 text-amber-400" />}
            label="Stars"
            value={<>{data.stars} <Star className="w-4 h-4 inline text-amber-400 -mt-1" /></>}
            sub={data.title}
            gradient="from-amber-500 to-orange-500"
          />
          <StatCard
            icon={<Code className="w-5 h-5 text-green-400" />}
            label="Problems Solved"
            value={<AnimatedCounter value={data.problemsSolved} />}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Globe className="w-5 h-5 text-blue-400" />}
            label="Global Rank"
            value={data.globalRank > 0 ? <><Hash className="w-4 h-4 inline -mt-0.5" /><AnimatedCounter value={data.globalRank} /></> : "N/A"}
            gradient="from-blue-500 to-indigo-500"
          />
          <StatCard
            icon={<Flag className="w-5 h-5 text-cyan-400" />}
            label="Country Rank"
            value={data.countryRank > 0 ? <><Hash className="w-4 h-4 inline -mt-0.5" /><AnimatedCounter value={data.countryRank} /></> : "N/A"}
            sub={data.country !== "Unknown" ? data.country : undefined}
            gradient="from-cyan-500 to-teal-500"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            label="Contests"
            value={<AnimatedCounter value={data.contestsAttended} />}
            gradient="from-yellow-500 to-amber-500"
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-400" />}
            label="Current Streak"
            value={<>{data.streak} day{data.streak !== 1 ? "s" : ""}</>}
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-purple-400" />}
            label="Active Days"
            value={<AnimatedCounter value={data.totalActiveDays} />}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<BarChart2 className="w-5 h-5 text-indigo-400" />}
            label="CPulse Score"
            value={data.cpulseRating ? <AnimatedCounter value={Math.round(data.cpulseRating)} /> : "N/A"}
            gradient="from-indigo-500 to-violet-500"
          />
        </div>

        {/* =================== TABS =================== */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
          {(["overview", "contests", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {tab === "overview" && "Rating History"}
              {tab === "contests" && `Contests (${data.contestsAttended})`}
              {tab === "activity" && "Activity"}
            </button>
          ))}
        </div>

        {/* =================== TAB: OVERVIEW (Rating Chart) =================== */}
        {activeTab === "overview" && data.history && data.history.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Rating History
            </h2>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="ccRatingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => { try { return new Date(v).toLocaleDateString("en-US", { month: "short", year: "2-digit" }); } catch { return v; } }}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  labelStyle={{ color: "#9ca3af", fontSize: 12 }}
                  itemStyle={{ color: "#f59e0b" }}
                  formatter={(val: number) => [val, "Rating"]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#ccRatingGrad)"
                  dot={{ fill: "#f59e0b", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "overview" && (!data.history || data.history.length === 0) && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No rating history available yet</p>
          </div>
        )}

        {/* =================== TAB: CONTESTS =================== */}
        {activeTab === "contests" && (
          <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Contest History
              </h2>
            </div>
            {data.contestHistory && data.contestHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th className="px-6 py-3 text-left">#</th>
                      <th className="px-6 py-3 text-left">Contest</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-right">Rank</th>
                      <th className="px-6 py-3 text-right">Rating</th>
                      <th className="px-6 py-3 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {[...data.contestHistory].reverse().map((c, i) => (
                      <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-500 text-sm">{data.contestHistory.length - i}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-white">
                            {c.contestName || c.contestCode || "Contest"}
                          </div>
                          {c.contestCode && (
                            <a
                              href={`https://www.codechef.com/${c.contestCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-amber-500 hover:text-amber-400"
                            >
                              {c.contestCode}
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(c.date)}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-white">
                          {c.rank ? `#${c.rank.toLocaleString()}` : "-"}
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${getRatingColor(c.score)}`}>
                          {c.score}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {c.ratingChange != null ? (
                            <span className={`inline-flex items-center gap-1 ${c.ratingChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {c.ratingChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {c.ratingChange >= 0 ? "+" : ""}{c.ratingChange}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No contest history available</p>
              </div>
            )}
          </div>
        )}

        {/* =================== TAB: ACTIVITY =================== */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {/* Activity summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 text-center">
                <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{data.streak}</div>
                <div className="text-xs text-gray-500 mt-1">Day Streak</div>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{data.totalActiveDays}</div>
                <div className="text-xs text-gray-500 mt-1">Active Days</div>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 text-center">
                <Code className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{data.problemsSolved}</div>
                <div className="text-xs text-gray-500 mt-1">Problems Solved</div>
              </div>
            </div>

            {/* Heatmap / submission activity */}
            {data.heatMap && data.heatMap.length > 0 ? (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" /> Submission Activity
                </h3>
                <div className="flex flex-wrap gap-1">
                  {data.heatMap.slice(-365).map((h, i) => {
                    const intensity = Math.min(h.count / 5, 1);
                    const bg = intensity > 0.8 ? "bg-green-400" : intensity > 0.5 ? "bg-green-500" : intensity > 0.2 ? "bg-green-600" : "bg-green-800";
                    return (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-sm ${bg} cursor-pointer`}
                        title={`${h.date}: ${h.count} submission${h.count !== 1 ? "s" : ""}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-green-900" />
                  <div className="w-3 h-3 rounded-sm bg-green-700" />
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <div className="w-3 h-3 rounded-sm bg-green-400" />
                  <span>More</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-12 text-center">
                <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No submission activity data available</p>
              </div>
            )}

            {/* Last contest performance */}
            {lastContest && (
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Last Contest Performance
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Contest</div>
                    <div className="text-sm font-medium text-white">{lastContest.contestName || lastContest.contestCode}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Date</div>
                    <div className="text-sm text-gray-300">{formatDate(lastContest.date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Rank</div>
                    <div className="text-sm font-bold text-white">{lastContest.rank ? `#${lastContest.rank.toLocaleString()}` : "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Rating Change</div>
                    <div className={`text-sm font-bold ${(lastContest.ratingChange ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {lastContest.ratingChange != null ? `${lastContest.ratingChange >= 0 ? "+" : ""}${lastContest.ratingChange}` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
