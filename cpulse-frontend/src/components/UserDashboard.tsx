import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface ProfileData {
  platform: string;
  handle: string;
  error?: string;
  // LeetCode
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  contestRating?: number;
  globalRanking?: number;
  topPercentage?: number;
  reputation?: number;
  avatar?: string;
  // Codeforces
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  contribution?: number;
  friendOfCount?: number;
  organization?: string;
  title?: string;
  // CodeChef
  stars?: number;
  globalRank?: number;
  countryRank?: number;
  problemsSolved?: number;
  division?: string;
  country?: string;
}

const PLATFORM_CONFIG: Record<string, { name: string; color: string; gradient: string; border: string; bg: string }> = {
  leetcode: { name: "LeetCode", color: "text-amber-400", gradient: "from-amber-500 to-orange-600", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  codeforces: { name: "Codeforces", color: "text-blue-400", gradient: "from-blue-500 to-cyan-600", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  codechef: { name: "CodeChef", color: "text-yellow-400", gradient: "from-yellow-600 to-amber-700", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900/40 rounded-xl p-4 border border-white/5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function LeetCodeCard({ data }: { data: ProfileData }) {
  const total = data.totalSolved || 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Solved" value={total} />
        <StatCard label="Easy" value={data.easySolved || 0} sub={`${total ? ((data.easySolved || 0) / total * 100).toFixed(0) : 0}%`} />
        <StatCard label="Medium" value={data.mediumSolved || 0} sub={`${total ? ((data.mediumSolved || 0) / total * 100).toFixed(0) : 0}%`} />
        <StatCard label="Hard" value={data.hardSolved || 0} sub={`${total ? ((data.hardSolved || 0) / total * 100).toFixed(0) : 0}%`} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Contest Rating" value={data.contestRating || "N/A"} />
        <StatCard label="Global Rank" value={data.globalRanking ? `#${data.globalRanking.toLocaleString()}` : "N/A"} />
        <StatCard label="Top %" value={data.topPercentage ? `${data.topPercentage.toFixed(1)}%` : "N/A"} />
      </div>
      {/* Difficulty Bar */}
      {total > 0 && (
        <div className="mt-2">
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-900">
            <div className="bg-emerald-500" style={{ width: `${(data.easySolved || 0) / total * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(data.mediumSolved || 0) / total * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(data.hardSolved || 0) / total * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-emerald-400">Easy</span>
            <span className="text-xs text-amber-400">Medium</span>
            <span className="text-xs text-red-400">Hard</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeforcesCard({ data }: { data: ProfileData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rating" value={data.rating || 0} />
        <StatCard label="Max Rating" value={data.maxRating || 0} />
        <StatCard label="Rank" value={data.rank || "N/A"} />
        <StatCard label="Max Rank" value={data.maxRank || "N/A"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Contribution" value={data.contribution || 0} />
        <StatCard label="Friend Of" value={data.friendOfCount || 0} />
        <StatCard label="Organization" value={data.organization || "N/A"} />
      </div>
    </div>
  );
}

function CodeChefCard({ data }: { data: ProfileData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Rating" value={data.rating || 0} />
        <StatCard label="Stars" value={data.stars ? `${"*".repeat(data.stars)}` : "N/A"} />
        <StatCard label="Division" value={data.division || "N/A"} />
        <StatCard label="Problems Solved" value={data.problemsSolved || 0} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Global Rank" value={data.globalRank ? `#${data.globalRank.toLocaleString()}` : "N/A"} />
        <StatCard label="Country Rank" value={data.countryRank ? `#${data.countryRank.toLocaleString()}` : "N/A"} />
        <StatCard label="Country" value={data.country || "N/A"} />
      </div>
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
  }, [user?.cpProfiles?.length]);

  const fetchProfileData = async () => {
    if (!user || user.cpProfiles.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/profiles/data");
      setProfileData(res.data.profiles);
    } catch {
      // Ignore errors
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
      await api.post("/auth/profiles", { platform: newPlatform, handle: newHandle.trim() });
      await refreshUser();
      setAddingProfile(false);
      setNewPlatform("");
      setNewHandle("");
      // Re-fetch data
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
      setProfileData((prev) => prev.filter((p) => !(p.platform === platform && p.handle === handle)));
    } catch {
      // Ignore
    } finally {
      setRemoveLoading(null);
    }
  };

  // Platforms not yet linked
  const linkedPlatforms = user?.cpProfiles.map((p) => p.platform) || [];
  const availablePlatforms = ["leetcode", "codeforces", "codechef"].filter(
    (p) => !linkedPlatforms.includes(p as any)
  );

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your dashboard</h2>
          <Link to="/login" className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
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
        <div>
          <h1 className="text-3xl font-bold text-white">
            {user.displayName ? `${user.displayName}'s Dashboard` : "My Dashboard"}
          </h1>
          <p className="text-gray-400 mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            {user.cpProfiles.length} profile{user.cpProfiles.length !== 1 ? "s" : ""} linked
          </span>
        </div>
      </div>

      {/* No profiles */}
      {user.cpProfiles.length === 0 && !addingProfile && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-700/50 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No profiles linked yet</h3>
          <p className="text-gray-400 mb-6">Link your competitive programming profiles to see your stats here.</p>
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
          {user.cpProfiles.map((p) => (
            <div key={`${p.platform}-${p.handle}`} className="bg-gray-800/50 border border-white/10 rounded-2xl p-8 animate-pulse">
              <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
              <div className="grid grid-cols-4 gap-3">
                <div className="h-20 bg-gray-700/50 rounded-xl" />
                <div className="h-20 bg-gray-700/50 rounded-xl" />
                <div className="h-20 bg-gray-700/50 rounded-xl" />
                <div className="h-20 bg-gray-700/50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {profileData.map((data) => {
            const config = PLATFORM_CONFIG[data.platform];
            if (!config) return null;

            return (
              <div key={`${data.platform}-${data.handle}`} className={`bg-gray-800/50 backdrop-blur-xl border ${config.border} rounded-2xl p-6 shadow-xl`}>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-sm font-bold`}>
                      {config.name}
                    </div>
                    <span className="text-white font-semibold text-lg">@{data.handle}</span>
                    {data.avatar && (
                      <img src={data.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white/10" />
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveProfile(data.platform, data.handle)}
                    disabled={removeLoading === `${data.platform}-${data.handle}`}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {removeLoading === `${data.platform}-${data.handle}` ? "Removing..." : "Remove"}
                  </button>
                </div>

                {/* Error state */}
                {data.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    Failed to fetch data: {data.error}
                  </div>
                ) : (
                  <>
                    {data.platform === "leetcode" && <LeetCodeCard data={data} />}
                    {data.platform === "codeforces" && <CodeforcesCard data={data} />}
                    {data.platform === "codechef" && <CodeChefCard data={data} />}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Profile Section */}
      {user.cpProfiles.length > 0 && !addingProfile && availablePlatforms.length > 0 && (
        <button
          onClick={() => setAddingProfile(true)}
          className="mt-6 w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-400 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Add Another Profile
        </button>
      )}

      {/* Add Profile Form */}
      {addingProfile && (
        <div className="mt-6 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Add CP Profile</h3>
            <button
              onClick={() => { setAddingProfile(false); setAddError(""); }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
              {(availablePlatforms.length > 0 ? availablePlatforms : ["leetcode", "codeforces", "codechef"]).map((p) => {
                const config = PLATFORM_CONFIG[p];
                const alreadyLinked = linkedPlatforms.includes(p as any);
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
                    <span className={`font-semibold ${newPlatform === p ? config.color : "text-gray-300"}`}>
                      {config.name}
                    </span>
                    {alreadyLinked && <p className="text-xs text-gray-500 mt-1">Already linked</p>}
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
                  placeholder={`Enter your ${PLATFORM_CONFIG[newPlatform]?.name} username`}
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={addLoading || !newHandle.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  ) : "Add"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
