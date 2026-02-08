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
import {
  Code,
  ExternalLink,
  Sparkles,
  Trophy,
  Users,
  Heart,
  Target,
  Zap,
  Globe,
  BarChart2,
  Award,
  Shield,
  Flag,
  CheckCircle,
  Clock,
  Flame,
  Calendar,
  Tag,
  Terminal
} from "lucide-react";
import MasteryRadar from "./MasteryRadar";
import CareerCompass from "./CareerCompass";
import LivePulse from "./LivePulse";

/* ===================== TYPES ===================== */

interface Growth {
  date: string;
  score: number;
}

interface Recommendation {
  name: string;
  rating: number;
  tags: string[];
  link: string;
  reason: string;
  hint?: string;
}

export interface UserStats {
  platform: "codeforces" | "leetcode" | "codechef";
  handle: string;

  // Codeforces
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;

  // LeetCode
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  totalSubmissions?: number;

  // CodeChef
  stars?: number;
  globalRank?: number;
  countryRank?: number;
  problemsSolved?: number;

  history: Growth[];
  cpulseRating?: number;

  // Rich Info
  avatar?: string;
  title?: string;
  contribution?: number;
  friendOfCount?: number;
  organization?: string;
  lastOnlineTimeSeconds?: number;
  contestRating?: number;
  globalRanking?: number;
  topPercentage?: number;
  reputation?: number;
  division?: string;
  country?: string;

  // Enhanced Fields
  contestsAttended?: number;
  streak?: number;
  totalActiveDays?: number;
  badges?: { name: string; icon?: string }[];
  languages?: { name: string; problemsSolved: number }[];
  topTags?: { tag: string; count: number }[];
  recentSubmissions?: { title: string; status: string; language: string; timestamp: string; tags?: string[]; rating?: number }[];
  registrationTimeSeconds?: number;
  city?: string;

  // Profile Details
  aboutMe?: string;
  skillTags?: string[];
  realName?: string;
  company?: string;
  school?: string;
  websites?: string[];
}

/* ===================== STAT CARD  ===================== */

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value ?? "N/A"}</p>
    </div>
  );
}

/* ===================== COMPONENT ===================== */

export default function PersonalGrowth() {
  const { platform, username } = useParams<{
    platform: "codeforces" | "leetcode" | "codechef";
    username: string;
  }>();

  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (!username || !platform) {
      setError("Missing username or platform");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    // Unified Fetch for all platform metrics
    const fetchUserData = async () => {
      try {
        const response = await api.get(
          `/api/metrics/${platform}/${username}`,
          { timeout: 15000 }
        );
        return response.data;
      } catch (err: any) {
        // If it's a network error with no response, it's likely a browser shield/ad-blocker
        if (!err.response && err.code !== 'ECONNABORTED') {
          throw new Error("Request blocked by browser shields or network. Please disable ad-blockers for this site.");
        }
        throw err;
      }
    };

    Promise
      .all([
        fetchUserData(),
      ])
      .then((res: any) => {
        setData(res[0]);
        setLoading(false);

        // Fetch Recommendations if platform is Codeforces
        if (platform === "codeforces") {
          setLoadingRecs(true);
api.get(`/api/recommend/${username}/${res[0].rating}`)
              .then((recRes: any) => {
              setRecommendations(recRes.data.recommendations || []);
            })
            .catch(err => console.error("Recs Error:", err))
            .finally(() => setLoadingRecs(false));
        }

          // Fetch AI Analysis
          setLoadingAnalysis(true);
          api.get(`/api/analysis/${platform}/${username}`)
            .then((res: any) => setAiAnalysis(res.data))
            .catch((err: any) => console.warn("Analysis unavailable:", err?.response?.data?.error || err?.message || "Unknown error"))
            .finally(() => setLoadingAnalysis(false));
      })
      .catch((err) => {
        console.error("Stats Error:", err);
        if (err.response) {
          const msg = err.response.data.error || "Failed to fetch user data.";
          const details = err.response.data.details ? ` (${err.response.data.details})` : "";
          setError(msg + details);
        } else {
          setError("Unable to connect to server. Check your network.");
        }
        setLoading(false);
      });
  }, [username, platform]);

  /* ===================== LOADING ===================== */

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        {/* LIVE PULSE FEED */}
        <LivePulse analysis={aiAnalysis} />

        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  /* ===================== ERROR ===================== */

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-6 rounded-xl text-center">
        <h2 className="text-lg font-semibold mb-2">
          Something went wrong
        </h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  /* ===================== UI ===================== */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ===================== EASTER EGG: GOD_ABHI ===================== */}
      {data.handle.toLowerCase() === "god_abhi" && data.platform === "leetcode" && (
        <div className="relative mb-10 text-center animate-bounce">
          <div className="inline-block relative">
            <Trophy size={64} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] mx-auto mb-2" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div>
          </div>
          <h1 className="text-5xl font-black text-golden-gradient tracking-tighter uppercase">
            The Legendary Creator
          </h1>
          <p className="text-indigo-400 font-bold tracking-[0.3em] text-xs mt-2 uppercase">
            All Hail the Architect of CPulse
          </p>
        </div>
      )}

      {/* ============= HEADER / PROFILE CARD ============= */}
      <div className={`
        bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border-t-8 transition-all duration-700
        ${data.handle.toLowerCase() === "god_abhi" && data.platform === "leetcode"
          ? "border-yellow-400 animate-golden-glow ring-4 ring-yellow-400/20"
          : "border-indigo-500"}
      `}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Top Row: Avatar + Handle + Rating */}
          <div className="flex flex-1 items-start gap-8 w-full">
            {/* Avatar Section */}
            <div className="relative group">
              <div className={`p-1 rounded-3xl ${data.handle.toLowerCase() === "god_abhi" && data.platform === "leetcode" ? "bg-gradient-to-tr from-yellow-400 via-yellow-100 to-yellow-500 animate-golden-glow" : "bg-indigo-500/20"} shadow-2xl`}>
                {data.avatar ? (
                  <img
                    src={data.avatar}
                    alt={data.handle}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                    onError={(e) => {
                      e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
                    <Trophy size={48} />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 rounded-lg text-white shadow-lg border-2 border-white dark:border-gray-800">
                  <Sparkles size={14} />
                </div>
              </div>
            </div>

            {/* Handle & AI Info Section */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={`text-5xl font-black tracking-tighter ${data.handle.toLowerCase() === "god_abhi" && data.platform === "leetcode" ? "text-golden-gradient" : "text-gray-900 dark:text-white"}`}>
                  {data.handle}
                </h2>
                {/* AI Vibe Badge */}
                {aiAnalysis && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-sm transition-all hover:scale-105">
                    <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      {aiAnalysis.vibe}
                    </span>
                  </div>
                )}
              </div>

              {/* Platform & Country Badges */}
              <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400 font-medium mt-3">
                <div className="flex items-center gap-1.5 capitalize bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-full text-xs">
                  <Globe size={14} className="text-gray-400" />
                  {data.platform}
                </div>
                {data.country && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs border border-emerald-100 dark:border-emerald-800/50">
                    <Flag size={14} />
                    {data.country}
                  </div>
                )}
                {data.division && (
                  <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs border border-purple-100 dark:border-purple-800/50">
                    <Shield size={14} />
                    {data.division}
                  </div>
                )}
              </div>
              <p className="text-sm text-indigo-500 font-black uppercase tracking-[0.3em] mt-2">
                {data.title || `${data.platform} Professional`}
              </p>

              {/* AI BIO Block */}
              {aiAnalysis && (
                <div className="mt-4 max-w-xl">
                  <div className="relative group">
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic font-medium leading-relaxed border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-r-2xl">
                      {aiAnalysis.bio}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={10} /> "{aiAnalysis.vibeQuote}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Large Pulse Rating Score */}
            <div className="flex flex-col items-end">
              <div className={`
                text-4xl font-black px-8 py-4 rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 hover:rotate-2
                ${data.handle.toLowerCase() === "god_abhi" && data.platform === "leetcode"
                  ? "bg-yellow-400 text-black shadow-yellow-400/50"
                  : "bg-indigo-600 text-white shadow-indigo-500/30"}
              `}>
                {data.platform === "codeforces" || data.platform === "codechef" ? data.rating : data.cpulseRating}
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-3">Pulse Rating</p>
            </div>
          </div>
        </div>



        {/* ===================== RICH STATS GRID ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800/50">
          {data.platform === "codeforces" && (
            <>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Users size={12} /> Contribution
                </p>
                <p className={`text-lg font-bold ${data.contribution && data.contribution > 0 ? 'text-emerald-500' : 'text-gray-500'}`}>
                  {data.contribution || 0}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Heart size={12} /> Friends
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.friendOfCount || 0}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Target size={12} /> Organization
                </p>
                <p className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 truncate">
                  {data.organization || "Independent"}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Zap size={12} /> Last Online
                </p>
                <p className="text-[11px] font-extrabold text-gray-500">
                  {data.lastOnlineTimeSeconds ? new Date(data.lastOnlineTimeSeconds * 1000).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </>
          )}

          {data.platform === "leetcode" && (
            <>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Trophy size={12} /> Contest Rating
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {data.contestRating || 'Unrated'}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Globe size={12} /> Global Rank
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  #{data.globalRanking?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Award size={12} /> Reputation
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.reputation || 0}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <BarChart2 size={12} /> Top %
                </p>
                <p className="text-lg font-bold text-emerald-500">
                  {data.topPercentage ? `${data.topPercentage.toFixed(2)}%` : 'N/A'}
                </p>
              </div>
            </>
          )}

          {data.platform === "codechef" && (
            <>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Shield size={12} /> Division
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {data.division || "Div ?"}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Globe size={12} /> Global Rank
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  #{data.globalRank?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Flag size={12} /> Country Rank
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  #{data.countryRank?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <CheckCircle size={12} /> Solved
                </p>
                <p className="text-lg font-bold text-emerald-500">
                  {data.problemsSolved || 0}
                </p>
              </div>
            </>
          )}
          </div>
        </div>

        {/* ===================== PROFILE DETAILS (All Platforms) ===================== */}
        {(data.realName || data.aboutMe || data.company || data.school || (data.websites && data.websites.length > 0) || (data.skillTags && data.skillTags.length > 0)) && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
              <Users className="text-indigo-500" /> Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.realName && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <Users size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real Name</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.realName}</p>
                  </div>
                </div>
              )}
              {data.company && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Target size={16} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.company}</p>
                  </div>
                </div>
              )}
              {data.school && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <Award size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">School</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.school}</p>
                  </div>
                </div>
              )}
              {data.organization && data.platform === "codeforces" && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Target size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.organization}</p>
                  </div>
                </div>
              )}
              {data.city && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <Globe size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{data.city}</p>
                  </div>
                </div>
              )}
            </div>

            {data.aboutMe && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.aboutMe}</p>
              </div>
            )}

            {data.websites && data.websites.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ExternalLink size={12} /> Websites
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.websites.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-800/50">
                      <ExternalLink size={10} /> {url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {data.skillTags && data.skillTags.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Tag size={12} /> Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.skillTags.map((skill, i) => (
                    <span key={i} className="text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-full border border-cyan-100 dark:border-cyan-800/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== RECOMMENDATIONS (Codeforces) ===================== */}
      {platform === "codeforces" && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group/recs mt-6">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] opacity-0 group-hover/recs:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">AI Recommended Challenges</h3>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse relative z-10">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/10 rounded-2xl"></div>)}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {recommendations.map((rec: Recommendation, i: number) => (
                <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/20 transition-all hover:-translate-y-1 shadow-lg group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                        Rating {rec.rating}
                      </span>
                      <Trophy size={18} className="text-indigo-200 opacity-60" />
                    </div>
                    <h4 className="font-extrabold text-lg mb-2 line-clamp-1 group-hover:text-yellow-200 transition-colors">{rec.name}</h4>
                    <p className="text-xs text-indigo-100/80 mb-4 line-clamp-3 italic font-medium">"{rec.reason}"</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {rec.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] font-bold bg-indigo-500/40 px-2 py-1 rounded-md border border-white/5">{tag}</span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={rec.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-center text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 shadow-xl transition-all active:scale-95"
                    >
                      Solve Now <ExternalLink size={14} />
                    </a>

                    {/* SMART AI HINT */}
                    {rec.hint && (
                      <div className="mt-2 group/hint">
                        <button
                          onClick={(e) => {
                            const el = e.currentTarget.nextElementSibling as HTMLElement;
                            el.classList.toggle('hidden');
                            e.currentTarget.classList.toggle('bg-indigo-400/30');
                          }}
                          className="w-full py-2 bg-indigo-500/20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2 border border-white/10"
                        >
                          <Sparkles size={12} /> Get AI Hint
                        </button>
                        <div className="hidden mt-3 p-4 bg-indigo-950/60 border border-indigo-400/30 rounded-2xl text-[11px] leading-relaxed text-indigo-50 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-xl">
                          <span className="text-yellow-400 font-black uppercase block mb-1">Coach Hint:</span>
                          {rec.hint}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 p-10 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-indigo-100 font-medium italic opacity-80">No specific challenges found. Keep grinding!</p>
            </div>
          )}
        </div>
      )}

      {/* ===================== BOTTOM STATS (Cards) ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {data.platform === "codeforces" && (
          <>
            <Stat label="Rating" value={data.rating} />
            <Stat label="Max Rating" value={data.maxRating} />
            <Stat label="Rank" value={data.rank} />
            <Stat label="Max Rank" value={data.maxRank} />
          </>
        )}

        {data.platform === "leetcode" && (
          <>
            <Stat label="Total Solved" value={data.totalSolved} />
            <Stat label="Easy" value={data.easySolved} />
            <Stat label="Medium" value={data.mediumSolved} />
            <Stat label="Hard" value={data.hardSolved} />
          </>
        )}

        {data.platform === "codechef" && (
          <>
            <Stat label="Current Rating" value={data.rating} />
            <Stat label="Max Rating" value={data.maxRating} />
            <Stat label="Stars" value={`${data.stars || 0}★`} />
            <Stat label="Global Rank" value={data.globalRank} />
            <Stat label="Country Rank" value={data.countryRank} />
            <Stat label="Problems Solved" value={data.problemsSolved} />
          </>
        )}
      </div>

      {/* ===================== STREAK & ACTIVITY (LeetCode) ===================== */}
      {data.platform === "leetcode" && (data.streak || data.totalActiveDays || (data.badges && data.badges.length > 0)) && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
            <Flame className="text-orange-500" /> Streak & Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.streak !== undefined && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800/50 text-center">
                <Flame size={28} className="text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{data.streak}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Day Streak</p>
              </div>
            )}
            {data.totalActiveDays !== undefined && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-center">
                <Calendar size={28} className="text-blue-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{data.totalActiveDays}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Active Days</p>
              </div>
            )}
            {data.contestsAttended !== undefined && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50 text-center">
                <Trophy size={28} className="text-purple-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{data.contestsAttended}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Contests</p>
              </div>
            )}
          </div>
          {/* Badges */}
          {data.badges && data.badges.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Award size={12} /> Badges Earned
              </p>
              <div className="flex flex-wrap gap-2">
                {data.badges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800/50">
                    {badge.icon && <img src={badge.icon} alt="" className="w-4 h-4" />}
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== CONTESTS ATTENDED (Codeforces) ===================== */}
      {data.platform === "codeforces" && data.contestsAttended !== undefined && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
            <Trophy className="text-purple-500" /> Contest Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50 text-center">
              <Trophy size={28} className="text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{data.contestsAttended}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Contests Attended</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-center">
              <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{data.totalSolved || 0}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Problems Solved</p>
            </div>
            {data.registrationTimeSeconds && (
              <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50 text-center">
                <Calendar size={28} className="text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                  {new Date(data.registrationTimeSeconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Member Since</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== LANGUAGE STATISTICS ===================== */}
      {data.languages && data.languages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
            <Terminal className="text-cyan-500" /> Languages Used
          </h3>
          <div className="space-y-3">
            {data.languages.slice(0, 8).map((lang, i) => {
              const maxCount = data.languages![0].problemsSolved;
              const pct = maxCount > 0 ? (lang.problemsSolved / maxCount) * 100 : 0;
              return (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{lang.name}</span>
                    <span className="text-xs font-bold text-gray-500">{lang.problemsSolved} solved</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700 group-hover:from-indigo-500 group-hover:to-purple-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TOP TAGS / TOPICS (LeetCode) ===================== */}
      {data.topTags && data.topTags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
            <Tag className="text-emerald-500" /> Top Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.topTags.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 transition-all hover:scale-105 hover:shadow-md"
              >
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{t.tag}</span>
                <span className="text-[10px] font-black bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== RECENT SUBMISSIONS ===================== */}
      {data.recentSubmissions && data.recentSubmissions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
            <Clock className="text-amber-500" /> Recent Submissions
          </h3>
          <div className="space-y-3">
            {data.recentSubmissions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{sub.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{sub.language}</span>
                    {sub.tags && sub.tags.slice(0, 2).map((tag, j) => (
                      <span key={j} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                    {sub.rating ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">R:{sub.rating}</span> : null}
                  </div>
                </div>
                <div className="flex flex-col items-end ml-4 shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${
                    sub.status === "OK" || sub.status === "Accepted"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}>
                    {sub.status}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(sub.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== GROWTH CHART  ===================== */}
      {data.history?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800/50 mt-6 transition-all hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <BarChart2 className="text-indigo-500" /> Performance Growth
            </h3>
            <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-full text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Pulse Metric
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} stroke="#6b7280" fontSize={10} fontWeight="bold" />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', background: 'white' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ===================== CAREER COMPASS ===================== */}
      <CareerCompass
        score={data.cpulseRating || 0}
        aiAdvice={aiAnalysis?.roadmapTip}
      />

      {/* ===================== CLEAN CODE TIP ===================== */}
      {aiAnalysis?.cleanCodeTip && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-emerald-600">
            <Code size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">AI Performance Insight</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">
              "{aiAnalysis.cleanCodeTip}"
            </p>
          </div>
        </div>
      )}
      {data.history?.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <p className="text-sm">
            No growth data yet. Stats shown above are current.
          </p>
        </div>
      )}
    </div>
  );
}
