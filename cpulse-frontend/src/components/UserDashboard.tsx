import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    fetchProfileData();
  }, [user?.cpProfiles?.length]); // eslint-disable-line

  const fetchProfileData = async () => {
    if (!user || user.cpProfiles.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/profiles/data");
      setProfileData(res.data.profiles);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform || !newHandle.trim()) return;

    setAddLoading(true);
    setAddError("");

    try {
      await api.post("/auth/profiles", {
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
      await api.delete(`/auth/profiles/${platform}/${handle}`);
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
