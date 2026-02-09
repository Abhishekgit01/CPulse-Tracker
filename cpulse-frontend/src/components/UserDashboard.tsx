import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { College, Course, JoinRequest } from "../types";

interface LanguageStat {
  name: string;
  problemsSolved: number;
}

interface TagStat {
  tag: string;
  count: number;
}

interface RecentSubmission {
  title: string;
  status: string;
  language: string;
  timestamp: string;
  tags?: string[];
  rating?: number;
}

interface Badge {
  name: string;
  icon: string;
}

interface ProfileData {
  platform: string;
  handle: string;
  error?: string;
  // Common
  avatar?: string;
  totalSolved?: number;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  contestsAttended?: number;
  languages?: LanguageStat[];
  recentSubmissions?: RecentSubmission[];
  // LeetCode specific
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  contestRating?: number;
  globalRanking?: number;
  topPercentage?: number;
  reputation?: number;
  streak?: number;
  totalActiveDays?: number;
  badges?: Badge[];
  topTags?: TagStat[];
  totalSubmissions?: number;
  // Codeforces specific
  contribution?: number;
  friendOfCount?: number;
  organization?: string;
  title?: string;
  country?: string;
  city?: string;
  // CodeChef specific
  stars?: number;
  globalRank?: number;
  countryRank?: number;
  problemsSolved?: number;
  division?: string;
}

interface CPulseReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  category: string;
}

interface CPulseScoreData {
  score: number;
  tier: string;
  title: string;
  nextTier: string | null;
  pointsToNextTier: number;
  platformScores: Record<string, number>;
  rewards: CPulseReward[];
  activityBonus: number;
  diversityBonus: number;
}

const PLATFORM_CONFIG: Record<
  string,
  { name: string; color: string; gradient: string; border: string; bg: string; accent: string }
> = {
  leetcode: {
    name: "LeetCode",
    color: "text-amber-400",
    gradient: "from-amber-500 to-orange-600",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    accent: "amber",
  },
  codeforces: {
    name: "Codeforces",
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-600",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    accent: "blue",
  },
  codechef: {
    name: "CodeChef",
    color: "text-yellow-400",
    gradient: "from-yellow-600 to-amber-700",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    accent: "yellow",
  },
};

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  "Bronze III": { bg: "from-amber-900 to-amber-800", border: "border-amber-700/50", text: "text-amber-400", glow: "shadow-amber-900/30" },
  "Bronze II":  { bg: "from-amber-900 to-amber-800", border: "border-amber-700/50", text: "text-amber-400", glow: "shadow-amber-900/30" },
  "Bronze I":   { bg: "from-amber-800 to-amber-700", border: "border-amber-600/50", text: "text-amber-300", glow: "shadow-amber-800/30" },
  "Silver III": { bg: "from-gray-700 to-gray-600", border: "border-gray-500/50", text: "text-gray-300", glow: "shadow-gray-700/30" },
  "Silver II":  { bg: "from-gray-700 to-gray-600", border: "border-gray-500/50", text: "text-gray-300", glow: "shadow-gray-700/30" },
  "Silver I":   { bg: "from-gray-600 to-gray-500", border: "border-gray-400/50", text: "text-gray-200", glow: "shadow-gray-600/30" },
  "Gold III":   { bg: "from-yellow-700 to-amber-600", border: "border-yellow-500/50", text: "text-yellow-300", glow: "shadow-yellow-700/30" },
  "Gold II":    { bg: "from-yellow-700 to-amber-600", border: "border-yellow-500/50", text: "text-yellow-300", glow: "shadow-yellow-700/30" },
  "Gold I":     { bg: "from-yellow-600 to-amber-500", border: "border-yellow-400/50", text: "text-yellow-200", glow: "shadow-yellow-600/30" },
  "Platinum":   { bg: "from-cyan-700 to-teal-600", border: "border-cyan-500/50", text: "text-cyan-300", glow: "shadow-cyan-700/30" },
  "Diamond":    { bg: "from-indigo-600 to-purple-600", border: "border-indigo-400/50", text: "text-indigo-200", glow: "shadow-indigo-600/50" },
};

function CPulseScoreCard({ data }: { data: CPulseScoreData }) {
  const tierStyle = TIER_COLORS[data.tier] || TIER_COLORS["Bronze III"];
  const earnedRewards = data.rewards.filter(r => r.earned);
  const unearnedRewards = data.rewards.filter(r => !r.earned);
  const nextUnearned = unearnedRewards[0];
  const [showAllRewards, setShowAllRewards] = useState(false);

  // Overall progress bar (0-1000)
  const overallProgress = Math.min((data.score / 1000) * 100, 100);

  return (
    <div className="mb-8 space-y-4">
      {/* Main Score Card */}
      <div className={`bg-gradient-to-r ${tierStyle.bg} backdrop-blur-xl border ${tierStyle.border} rounded-2xl p-6 shadow-xl ${tierStyle.glow}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{data.score}</span>
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">CPulse</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${tierStyle.text}`}>{data.tier}</span>
                {data.activityBonus > 0 && (
                  <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                    +{data.activityBonus} Active
                  </span>
                )}
                {data.diversityBonus > 0 && (
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                    +{data.diversityBonus} Multi
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70 font-medium">{data.title}</p>
              {data.nextTier && (
                <p className="text-xs text-white/40 mt-1">
                  {data.pointsToNextTier} pts to {data.nextTier}
                </p>
              )}
            </div>
          </div>

          {/* Earned count badge */}
          <div className="text-right">
            <div className="text-3xl font-black text-white/90">{earnedRewards.length}</div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Rewards</p>
          </div>
        </div>

        {/* Progress Bar to next tier */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-white/40 font-bold mb-1">
            <span>Score Progress</span>
            <span>{data.score} / 1000</span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/40 to-white/70 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Platform Score Breakdown */}
        {Object.keys(data.platformScores).length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {Object.entries(data.platformScores).map(([platform, score]) => (
              <div key={platform} className="bg-black/20 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider capitalize">{platform}</p>
                <p className="text-lg font-bold text-white">{score}</p>
                <div className="h-1 bg-black/30 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      platform === "codeforces" ? "bg-blue-400" :
                      platform === "leetcode" ? "bg-amber-400" : "bg-yellow-400"
                    }`}
                    style={{ width: `${(score / 1000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards Section */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg">
              <span role="img" aria-label="trophy">&#127942;</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Rewards & Achievements</h3>
              <p className="text-xs text-gray-400">
                {earnedRewards.length} of {data.rewards.length} earned
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAllRewards(!showAllRewards)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {showAllRewards ? "Show Less" : "Show All"}
          </button>
        </div>

        {/* Next reward to unlock */}
        {nextUnearned && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Next Reward</p>
            <div className="flex items-center gap-2">
              <span className="text-lg opacity-40">{nextUnearned.icon}</span>
              <span className="text-sm font-medium text-white">{nextUnearned.name}</span>
              <span className="text-xs text-gray-400">- {nextUnearned.description}</span>
            </div>
          </div>
        )}

        {/* Earned Rewards Grid */}
        {earnedRewards.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {earnedRewards.map(r => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 group relative"
                title={r.description}
              >
                <span className="text-sm">{r.icon}</span>
                <span className="text-xs font-semibold text-amber-300">{r.name}</span>
              </div>
            ))}
          </div>
        )}

        {earnedRewards.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No rewards earned yet. Keep grinding!
          </p>
        )}

        {/* All rewards (collapsed by default) */}
        {showAllRewards && (
          <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">All Rewards</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.rewards.map(r => (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    r.earned
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-gray-900/30 border-white/5 opacity-50"
                  }`}
                >
                  <span className={`text-lg ${r.earned ? "" : "grayscale"}`}>{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${r.earned ? "text-white" : "text-gray-400"}`}>
                      {r.name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{r.description}</p>
                  </div>
                  {r.earned && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
                      Earned
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-500">{icon}</span>}
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function LanguageBar({ languages }: { languages: LanguageStat[] }) {
  if (!languages || languages.length === 0) return null;
  const total = languages.reduce((s, l) => s + l.problemsSolved, 0);
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-400 mb-3">Languages Used</h4>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-900 mb-2">
        {languages.map((lang, i) => (
          <div
            key={lang.name}
            className={`${colors[i % colors.length]} transition-all`}
            style={{ width: `${(lang.problemsSolved / total) * 100}%` }}
            title={`${lang.name}: ${lang.problemsSolved}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {languages.slice(0, 5).map((lang, i) => (
          <div key={lang.name} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
            {lang.name} ({lang.problemsSolved})
          </div>
        ))}
      </div>
    </div>
  );
}

function TopTags({ tags }: { tags: TagStat[] }) {
  if (!tags || tags.length === 0) return null;
  const maxCount = tags[0]?.count || 1;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-400 mb-3">Top Problem Tags</h4>
      <div className="space-y-2">
        {tags.slice(0, 6).map((t) => (
          <div key={t.tag} className="flex items-center gap-3">
            <span className="text-xs text-gray-300 w-28 truncate">{t.tag}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${(t.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{t.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ submissions }: { submissions: RecentSubmission[] }) {
  if (!submissions || submissions.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Submissions</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {submissions.slice(0, 8).map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-900/30 border border-white/5">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                s.status === "Accepted" || s.status === "OK"
                  ? "bg-emerald-500"
                  : s.status === "WRONG_ANSWER"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{s.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{s.language}</span>
                <span className="text-xs text-gray-600">|</span>
                <span className="text-xs text-gray-500">
                  {new Date(s.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                s.status === "Accepted" || s.status === "OK"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {s.status === "OK" ? "AC" : s.status === "Accepted" ? "AC" : s.status?.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeetCodeCard({ data }: { data: ProfileData }) {
  const total = data.totalSolved || 0;
  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Solved" value={total} />
        <StatCard
          label="Easy"
          value={data.easySolved || 0}
          sub={`${total ? (((data.easySolved || 0) / total) * 100).toFixed(0) : 0}%`}
        />
        <StatCard
          label="Medium"
          value={data.mediumSolved || 0}
          sub={`${total ? (((data.mediumSolved || 0) / total) * 100).toFixed(0) : 0}%`}
        />
        <StatCard
          label="Hard"
          value={data.hardSolved || 0}
          sub={`${total ? (((data.hardSolved || 0) / total) * 100).toFixed(0) : 0}%`}
        />
      </div>

      {/* Difficulty Bar */}
      {total > 0 && (
        <div>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-900">
            <div
              className="bg-emerald-500"
              style={{ width: `${((data.easySolved || 0) / total) * 100}%` }}
            />
            <div
              className="bg-amber-500"
              style={{ width: `${((data.mediumSolved || 0) / total) * 100}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${((data.hardSolved || 0) / total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-emerald-400">Easy</span>
            <span className="text-xs text-amber-400">Medium</span>
            <span className="text-xs text-red-400">Hard</span>
          </div>
        </div>
      )}

      {/* Contest & Streak Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Contest Rating" value={data.contestRating || "N/A"} />
        <StatCard
          label="Global Rank"
          value={data.globalRanking ? `#${data.globalRanking.toLocaleString()}` : "N/A"}
        />
        <StatCard label="Contests" value={data.contestsAttended || 0} />
        <StatCard
          label="Top %"
          value={data.topPercentage ? `${data.topPercentage.toFixed(1)}%` : "N/A"}
        />
      </div>

      {/* Streak & Activity */}
      {(data.streak !== undefined || data.totalActiveDays !== undefined) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Current Streak" value={`${data.streak || 0} days`} />
          <StatCard label="Active Days" value={data.totalActiveDays || 0} />
          <StatCard label="Reputation" value={data.reputation || 0} />
        </div>
      )}

      {/* Badges */}
      {data.badges && data.badges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Badges ({data.badges.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
              >
                {b.icon && (
                  <img src={b.icon} alt="" className="w-4 h-4" />
                )}
                {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two columns: Languages + Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguageBar languages={data.languages || []} />
        <TopTags tags={data.topTags || []} />
      </div>

      {/* Recent Submissions */}
      <RecentActivity submissions={data.recentSubmissions || []} />
    </div>
  );
}

function CodeforcesCard({ data }: { data: ProfileData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rating" value={data.rating || 0} />
        <StatCard label="Max Rating" value={data.maxRating || 0} />
        <StatCard label="Rank" value={data.rank || "N/A"} />
        <StatCard label="Max Rank" value={data.maxRank || "N/A"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Problems Solved" value={data.totalSolved || 0} />
        <StatCard label="Contests" value={data.contestsAttended || 0} />
        <StatCard label="Contribution" value={data.contribution || 0} />
        <StatCard label="Friend Of" value={data.friendOfCount || 0} />
      </div>
      {(data.organization || data.country) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Organization" value={data.organization || "N/A"} />
          {data.country && <StatCard label="Country" value={data.country} />}
          {data.city && <StatCard label="City" value={data.city} />}
        </div>
      )}

      {/* Languages + Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguageBar languages={data.languages || []} />
        <RecentActivity submissions={data.recentSubmissions || []} />
      </div>
    </div>
  );
}

function CodeChefCard({ data }: { data: ProfileData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rating" value={data.rating || 0} />
        <StatCard label="Max Rating" value={data.maxRating || 0} />
        <StatCard
          label="Stars"
          value={data.stars ? "\u2605".repeat(data.stars) : "N/A"}
        />
        <StatCard label="Division" value={data.division || "N/A"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Problems Solved" value={data.problemsSolved || 0} />
        <StatCard
          label="Global Rank"
          value={data.globalRank ? `#${data.globalRank.toLocaleString()}` : "N/A"}
        />
        <StatCard
          label="Country Rank"
          value={data.countryRank ? `#${data.countryRank.toLocaleString()}` : "N/A"}
        />
      </div>
      {data.country && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Country" value={data.country} />
        </div>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProfile, setAddingProfile] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [collegeError, setCollegeError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [showBrowser, setShowBrowser] = useState(false);
  const [cpulseScore, setCpulseScore] = useState<CPulseScoreData | null>(null);
  const [cpulseLoading, setCpulseLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
    fetchCPulseScore();
  }, [user?.cpProfiles?.length]); // eslint-disable-line

  const fetchProfileData = async () => {
    if (!user || user.cpProfiles.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/auth/profiles/data");
      setProfileData(res.data.profiles);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchCPulseScore = async () => {
    if (!user) {
      setCpulseLoading(false);
      return;
    }
    setCpulseLoading(true);
    try {
      const res = await api.get("/api/auth/cpulse-score");
      setCpulseScore(res.data);
    } catch {
      // Ignore
    } finally {
      setCpulseLoading(false);
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform || !newHandle.trim()) return;

    setAddLoading(true);
    setAddError("");

    try {
      await api.post("/api/auth/profiles", {
        platform: newPlatform,
        handle: newHandle.trim(),
      });
      await refreshUser();
      setAddingProfile(false);
      setNewPlatform("");
      setNewHandle("");
      setLoading(true);
      await fetchProfileData();
    } catch (err: any) {
      setAddError(err.response?.data?.error || "Failed to add profile");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveProfile = async (platform: string, handle: string) => {
    setRemoveLoading(`${platform}-${handle}`);
    try {
      await api.delete(`/api/auth/profiles/${platform}/${handle}`);
      await refreshUser();
      setProfileData((prev) =>
        prev.filter((p) => !(p.platform === platform && p.handle === handle))
      );
    } catch {
      // Ignore
    } finally {
      setRemoveLoading(null);
    }
  };

  const linkedPlatforms =
    user?.cpProfiles.map(
      (p: { platform: string; handle: string }) => p.platform
    ) || [];

  const fetchColleges = async () => {
    try {
      const res = await api.get("/api/colleges");
      setColleges(res.data.colleges);
    } catch {}
  };

  const fetchCoursesForCollege = async (collegeId: string) => {
    setSelectedCollege(collegeId);
    try {
      const res = await api.get(`/api/colleges/${collegeId}/courses`);
      setCourses(res.data.courses);
    } catch {}
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get("/api/join-requests/my");
      setMyRequests(res.data.requests);
    } catch {}
  };

  useEffect(() => {
    if (user) fetchMyRequests();
  }, [user?.courseId]); // eslint-disable-line

  const handleRequestJoin = async (collegeId: string, courseId: string) => {
    setCollegeLoading(true);
    setCollegeError("");
    try {
      await api.post("/api/join-requests", { collegeId, courseId, message: requestMessage });
      setRequestMessage("");
      await fetchMyRequests();
      setShowBrowser(false);
    } catch (err: any) {
      setCollegeError(err.response?.data?.error || "Failed to send request");
    } finally {
      setCollegeLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await api.delete(`/api/join-requests/${requestId}`);
      await fetchMyRequests();
    } catch {}
  };

  const handleLeaveCourse = async () => {
    setCollegeLoading(true);
    try {
      await api.post("/api/auth/leave-course");
      await refreshUser();
    } catch (err: any) {
      setCollegeError(err.response?.data?.error || "Failed to leave course");
    } finally {
      setCollegeLoading(false);
    }
  };

  const handleLeaveCollege = async () => {
    setCollegeLoading(true);
    try {
      await api.post("/api/auth/leave-college");
      await refreshUser();
    } catch (err: any) {
      setCollegeError(err.response?.data?.error || "Failed to leave college");
    } finally {
      setCollegeLoading(false);
    }
  };
  const availablePlatforms = ["leetcode", "codeforces", "codechef"].filter(
    (p) => !linkedPlatforms.includes(p)
  );

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Please log in to view your dashboard
          </h2>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/25">
            {(user.displayName || user.email)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {user.displayName || "My Dashboard"}
            </h1>
            <p className="text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            {user.cpProfiles.length} profile
            {user.cpProfiles.length !== 1 ? "s" : ""} linked
          </span>
          </div>
          </div>

          {/* CPulse Score Card */}
          {cpulseLoading ? (
            <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-8 mb-8 animate-pulse">
              <div className="h-20 bg-gray-700/50 rounded-xl mb-4" />
              <div className="h-2 bg-gray-700/50 rounded-full" />
            </div>
          ) : cpulseScore ? (
            <CPulseScoreCard data={cpulseScore} />
          ) : null}

          {/* College/Course Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">College & Course</h2>
              <p className="text-sm text-gray-400">
                {user.college
                  ? `${user.college.name}${user.course ? ` - ${user.course.name}` : ""}`
                  : "Join a college and course to see your leaderboard"}
              </p>
            </div>
            {(user.role === "manager" || user.role === "admin") && (
              <span className="ml-auto px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-400 text-xs font-semibold uppercase">
                {user.role}
              </span>
            )}
          </div>

          {collegeError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {collegeError}
            </div>
          )}

          {/* State: In College + Course */}
          {user.college && user.course ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex-1">
                  <span className="text-emerald-400 font-semibold">{user.college.name}</span>
                  <span className="text-gray-500 mx-2">/</span>
                  <span className="text-white font-medium">{user.course.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({user.course.code})</span>
                </div>
                <span className="text-xs text-emerald-400/60 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">Joined</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/college"
                  className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors"
                >
                  View Leaderboard
                </Link>
                <button
                  onClick={handleLeaveCourse}
                  disabled={collegeLoading}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  Leave Course
                </button>
                <button
                  onClick={handleLeaveCollege}
                  disabled={collegeLoading}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  Leave College
                </button>
              </div>
            </div>
          ) : user.college && !user.course ? (
            /* State: In College, No Course */
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-semibold">{user.college.name}</span>
                <span className="text-xs text-amber-400/60 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15">No course selected</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowBrowser(true); fetchCoursesForCollege(user.collegeId!); }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors"
                >
                  Browse Courses
                </button>
                <button
                  onClick={handleLeaveCollege}
                  disabled={collegeLoading}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  Leave College
                </button>
              </div>
            </div>
          ) : (
            /* State: Not in College */
            <div className="space-y-4">
              {/* Pending Requests */}
              {myRequests.filter(r => r.status === "pending").length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-medium">Pending Requests:</p>
                  {myRequests.filter(r => r.status === "pending").map(req => (
                    <div key={req._id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex-1">
                        <span className="text-amber-400 font-medium">
                          {typeof req.collegeId === "object" ? req.collegeId.name : "College"}
                        </span>
                        {req.courseId && typeof req.courseId === "object" && (
                          <>
                            <span className="text-gray-500 mx-2">/</span>
                            <span className="text-white">{req.courseId.name}</span>
                          </>
                        )}
                        <span className="text-xs text-amber-400/60 ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15">Pending</span>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(req._id)}
                        className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowBrowser(true); fetchColleges(); }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                Browse Colleges
              </button>
            </div>
          )}

          {/* College/Course Browser Modal */}
          {showBrowser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBrowser(false)}>
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedCollege ? "Select a Course" : "Select a College"}
                  </h3>
                  <button onClick={() => { setShowBrowser(false); setSelectedCollege(null); }} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {collegeError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                    {collegeError}
                  </div>
                )}

                {!selectedCollege ? (
                  /* College List */
                  <div className="space-y-2">
                    {colleges.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No colleges available yet.</p>
                    ) : (
                      colleges.map(college => (
                        <button
                          key={college._id}
                          onClick={() => fetchCoursesForCollege(college._id)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-gray-800/50 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-white font-medium">{college.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({college.code})</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{college.courseCount || 0} courses</span>
                              <span>{college.memberCount || 0} members</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                          </div>
                          {college.description && (
                            <p className="text-xs text-gray-400 mt-1">{college.description}</p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  /* Course List */
                  <div className="space-y-2">
                    <button
                      onClick={() => { setSelectedCollege(null); fetchColleges(); }}
                      className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      Back to Colleges
                    </button>
                    {courses.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No courses in this college yet.</p>
                    ) : (
                      courses.map(course => {
                        const hasPending = myRequests.some(r => r.status === "pending" && typeof r.courseId === "object" && r.courseId?._id === course._id);
                        return (
                          <div
                            key={course._id}
                            className="px-4 py-3 rounded-xl bg-gray-800/50 border border-white/5"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-white font-medium">{course.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({course.code})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{course.memberCount || 0} members</span>
                                {hasPending ? (
                                  <span className="text-xs text-amber-400 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">Pending</span>
                                ) : (
                                  <button
                                    onClick={() => handleRequestJoin(selectedCollege!, course._id)}
                                    disabled={collegeLoading}
                                    className="text-xs text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                  >
                                    {collegeLoading ? "Sending..." : "Request to Join"}
                                  </button>
                                )}
                              </div>
                            </div>
                            {course.description && (
                              <p className="text-xs text-gray-400 mt-1">{course.description}</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* No profiles */}
      {user.cpProfiles.length === 0 && !addingProfile && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-700/50 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No profiles linked yet
          </h3>
          <p className="text-gray-400 mb-6">
            Link your competitive programming profiles to see your stats here.
          </p>
          <button
            onClick={() => setAddingProfile(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            Add Your First Profile
          </button>
        </div>
      )}

      {/* Profile Cards */}
      {loading && user.cpProfiles.length > 0 ? (
        <div className="space-y-6">
          {user.cpProfiles.map(
            (p: { platform: string; handle: string }) => (
              <div
                key={`${p.platform}-${p.handle}`}
                className="bg-gray-800/50 border border-white/10 rounded-2xl p-8 animate-pulse"
              >
                <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
                <div className="grid grid-cols-4 gap-3">
                  <div className="h-20 bg-gray-700/50 rounded-xl" />
                  <div className="h-20 bg-gray-700/50 rounded-xl" />
                  <div className="h-20 bg-gray-700/50 rounded-xl" />
                  <div className="h-20 bg-gray-700/50 rounded-xl" />
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {profileData.map((data) => {
            const config = PLATFORM_CONFIG[data.platform];
            if (!config) return null;

            return (
              <div
                key={`${data.platform}-${data.handle}`}
                className={`bg-gray-800/50 backdrop-blur-xl border ${config.border} rounded-2xl p-6 shadow-xl`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {data.avatar && (
                      <img
                        src={data.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-white/10"
                      />
                    )}
                    <div
                      className={`px-3 py-1 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-sm font-bold`}
                    >
                      {config.name}
                    </div>
                    <span className="text-white font-semibold text-lg">
                      @{data.handle}
                    </span>
                    {data.title && data.title !== "Member" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                        {data.title}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveProfile(data.platform, data.handle)}
                    disabled={
                      removeLoading === `${data.platform}-${data.handle}`
                    }
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {removeLoading === `${data.platform}-${data.handle}`
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>

                {/* Error state */}
                {data.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    Failed to fetch data: {data.error}
                  </div>
                ) : (
                  <>
                    {data.platform === "leetcode" && (
                      <LeetCodeCard data={data} />
                    )}
                    {data.platform === "codeforces" && (
                      <CodeforcesCard data={data} />
                    )}
                    {data.platform === "codechef" && (
                      <CodeChefCard data={data} />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Profile Button */}
      {user.cpProfiles.length > 0 &&
        !addingProfile &&
        availablePlatforms.length > 0 && (
          <button
            onClick={() => setAddingProfile(true)}
            className="mt-6 w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-400 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Another Profile ({availablePlatforms.length} available)
          </button>
        )}

      {/* Add Profile Form */}
      {addingProfile && (
        <div className="mt-6 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Add CP Profile
            </h3>
            <button
              onClick={() => {
                setAddingProfile(false);
                setAddError("");
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {addError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {addError}
            </div>
          )}

          <form onSubmit={handleAddProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(availablePlatforms.length > 0
                ? availablePlatforms
                : ["leetcode", "codeforces", "codechef"]
              ).map((p) => {
                const config = PLATFORM_CONFIG[p];
                const alreadyLinked = linkedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={alreadyLinked}
                    onClick={() => setNewPlatform(p)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      newPlatform === p
                        ? `${config.border} ${config.bg}`
                        : alreadyLinked
                        ? "border-white/5 bg-gray-900/30 opacity-40 cursor-not-allowed"
                        : "border-white/10 bg-gray-900/30 hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        newPlatform === p ? config.color : "text-gray-300"
                      }`}
                    >
                      {config.name}
                    </span>
                    {alreadyLinked && (
                      <p className="text-xs text-gray-500 mt-1">
                        Already linked
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {newPlatform && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder={`Enter your ${
                    PLATFORM_CONFIG[newPlatform]?.name
                  } username`}
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={addLoading || !newHandle.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
