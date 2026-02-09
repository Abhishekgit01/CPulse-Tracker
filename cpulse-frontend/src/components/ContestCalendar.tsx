import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import ContestCard from "./ContestCard";
import ContestHistory from "./ContestHistory";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Trophy,
  Rocket,
  Bookmark,
  ExternalLink,
  MapPin,
  Users,
  Clock,
  Globe,
} from "lucide-react";

/* =================== Types =================== */
interface Contest {
  _id: string;
  name: string;
  platform: "codeforces" | "codechef" | "leetcode" | "atcoder";
  startTime: string;
  duration: number;
  url: string;
  phase?: string;
  type?: string;
  participants?: number;
}

interface Hackathon {
  id: string;
  name: string;
  tagline: string;
  url: string;
  source: "devfolio" | "mlh" | "devpost" | "unstop";
  startDate: string;
  endDate: string;
  location: string;
  mode: "online" | "in-person" | "hybrid";
  logo?: string;
  themes: string[];
  prizes?: string;
  participants?: number;
  status: "upcoming" | "open" | "ended";
}

type Tab = "upcoming" | "hackathons" | "history";

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  devfolio: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  mlh: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  devpost: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  unstop: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
};

const MODE_BADGE: Record<string, { color: string; label: string }> = {
  online: { color: "text-green-400 bg-green-500/10 border-green-500/20", label: "Online" },
  "in-person": { color: "text-orange-400 bg-orange-500/10 border-orange-500/20", label: "In-Person" },
  hybrid: { color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: "Hybrid" },
};

/* =================== Component =================== */
export default function ContestCalendar() {
  const { token } = useAuth();

  // Contests state
  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  // Hackathons state
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [hackLoading, setHackLoading] = useState(false);
  const [hackError, setHackError] = useState("");
  const [hackFilter, setHackFilter] = useState<string>("all"); // all, devfolio, mlh, devpost, unstop
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [hackSearch, setHackSearch] = useState("");

  // Bookmarking state
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedHackIds, setSavedHackIds] = useState<Set<string>>(new Set());

  /* ---------- Fetch contests ---------- */
  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; contests: Contest[] }>("/api/contests");
      if (response.data.success) {
        setContests(response.data.contests);
        setFilteredContests(response.data.contests);
      }
      setError("");
    } catch (err: any) {
      console.error("Error fetching contests:", err);
      setError("Failed to load contests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Fetch saved contests ---------- */
  const fetchSaved = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<{ success: boolean; contests: any[] }>("/api/contests/saved");
      if (res.data.success) {
        setSavedIds(new Set(res.data.contests.map((c: any) => c.contestId)));
      }
    } catch {
      // silently fail
    }
  }, [token]);

  /* ---------- Toggle bookmark ---------- */
  const toggleSave = async (contest: Contest) => {
    if (!token) return;
    const id = contest._id;
    if (savedIds.has(id)) {
      // unsave
      try {
        await api.delete(`/api/contests/saved/${id}`);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch {}
    } else {
      // save
      try {
        await api.post("/api/contests/saved", {
          contestId: id,
          platform: contest.platform,
          name: contest.name,
          startTime: contest.startTime,
          duration: contest.duration,
          url: contest.url,
        });
        setSavedIds((prev) => new Set(prev).add(id));
      } catch {}
    }
  };

  /* ---------- Fetch hackathons ---------- */
  const fetchHackathons = useCallback(async () => {
    try {
      setHackLoading(true);
      setHackError("");
      const params: any = {};
      if (locationFilter && locationFilter !== "all") params.location = locationFilter;
      const res = await api.get<{ success: boolean; hackathons: Hackathon[] }>("/api/hackathons", { params });
      if (res.data.success) {
        setHackathons(res.data.hackathons);
      }
    } catch (err: any) {
      console.error("Error fetching hackathons:", err);
      setHackError("Failed to load hackathons.");
    } finally {
      setHackLoading(false);
    }
  }, [locationFilter]);

  /* ---------- Fetch saved hackathons ---------- */
  const fetchSavedHackathons = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<{ success: boolean; hackathons: any[] }>("/api/hackathons/saved");
      if (res.data.success) {
        setSavedHackIds(new Set(res.data.hackathons.map((h: any) => h.hackathonId)));
      }
    } catch {}
  }, [token]);

  /* ---------- Toggle hackathon bookmark ---------- */
  const toggleSaveHackathon = async (hack: Hackathon) => {
    if (!token) return;
    if (savedHackIds.has(hack.id)) {
      try {
        await api.delete(`/api/hackathons/saved/${hack.id}`);
        setSavedHackIds((prev) => {
          const next = new Set(prev);
          next.delete(hack.id);
          return next;
        });
      } catch {}
    } else {
      try {
        await api.post("/api/hackathons/saved", {
          hackathonId: hack.id,
          source: hack.source,
          name: hack.name,
          url: hack.url,
          startDate: hack.startDate,
          endDate: hack.endDate,
          location: hack.location,
        });
        setSavedHackIds((prev) => new Set(prev).add(hack.id));
      } catch {}
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (activeTab === "upcoming") {
        await api.post("/api/contests/refresh");
        await fetchContests();
      } else if (activeTab === "hackathons") {
        await api.post("/api/hackathons/refresh");
        await fetchHackathons();
      }
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContests();
    fetchSaved();
    fetchSavedHackathons();
  }, [fetchSaved, fetchSavedHackathons]);

  useEffect(() => {
    if (activeTab === "hackathons") {
      fetchHackathons();
    }
  }, [activeTab, fetchHackathons]);

  // Filter contests
  useEffect(() => {
    if (selectedPlatform === "all") {
      setFilteredContests(contests);
    } else {
      setFilteredContests(contests.filter((c) => c.platform === selectedPlatform));
    }
  }, [selectedPlatform, contests]);

  // Filter hackathons
  const filteredHackathons = hackathons.filter((h) => {
    if (hackFilter !== "all" && h.source !== hackFilter) return false;
    if (hackSearch) {
      const q = hackSearch.toLowerCase();
      if (
        !h.name.toLowerCase().includes(q) &&
        !h.tagline?.toLowerCase().includes(q) &&
        !h.location.toLowerCase().includes(q) &&
        !h.themes.some((t) => t.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });

  // Group contests by date
  const groupedContests = filteredContests.reduce((acc, contest) => {
    const date = new Date(contest.startTime).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(contest);
    return acc;
  }, {} as Record<string, Contest[]>);

  const platformCounts = {
    all: contests.length,
    codeforces: contests.filter((c) => c.platform === "codeforces").length,
    codechef: contests.filter((c) => c.platform === "codechef").length,
    leetcode: contests.filter((c) => c.platform === "leetcode").length,
  };

  if (loading && activeTab === "upcoming") {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
              <Calendar className="text-indigo-400" size={40} />
              Events
            </h1>
            <p className="text-gray-400 mt-2">
              Contests, hackathons, and your participation history
            </p>
          </div>

          {activeTab !== "history" && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-6 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
            }`}
          >
            <Calendar size={16} />
            Contests
          </button>
          <button
            onClick={() => setActiveTab("hackathons")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "hackathons"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
            }`}
          >
            <Rocket size={16} />
            Hackathons
            {hackathons.length > 0 && (
              <span className="ml-1 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                {hackathons.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
            }`}
          >
            <Trophy size={16} />
            History
          </button>
        </div>

        {/* Stats Bar - contests tab only */}
        {activeTab === "upcoming" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
              <div className="text-3xl font-bold text-indigo-400">{platformCounts.all}</div>
              <div className="text-sm text-gray-400">Total Contests</div>
            </div>
            <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
              <div className="text-3xl font-bold text-red-400">{platformCounts.codeforces}</div>
              <div className="text-sm text-gray-400">Codeforces</div>
            </div>
            <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
              <div className="text-3xl font-bold text-amber-400">{platformCounts.codechef}</div>
              <div className="text-sm text-gray-400">CodeChef</div>
            </div>
            <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
              <div className="text-3xl font-bold text-yellow-400">{platformCounts.leetcode}</div>
              <div className="text-sm text-gray-400">LeetCode</div>
            </div>
          </div>
        )}
      </div>

      {/* =================== CONTESTS TAB =================== */}
      {activeTab === "upcoming" && (
        <>
          {/* Platform Filter */}
          <div className="mb-6 flex items-center gap-3">
            <Filter size={20} className="text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {["all", "codeforces", "codechef", "leetcode"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedPlatform === platform
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-800/50 border border-white/10 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  {platform !== "all" && (
                    <span className="ml-2 text-xs opacity-70">
                      ({platformCounts[platform as keyof typeof platformCounts]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Saved filter toggle */}
          {token && savedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Bookmark size={16} className="text-indigo-400" />
              <span className="text-sm text-gray-400">
                {savedIds.size} contest{savedIds.size !== 1 ? "s" : ""} bookmarked
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {filteredContests.length === 0 ? (
            <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-white/5">
              <TrendingUp size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">No upcoming contests found</h3>
              <p className="text-gray-500 mt-2">Try selecting a different platform or refresh</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedContests).map(([date, dateContests]) => (
                <div key={date}>
                  <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                    {date}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dateContests.map((contest) => (
                      <ContestCard
                        key={contest._id}
                        contest={contest}
                        isSaved={savedIds.has(contest._id)}
                        onToggleSave={token ? toggleSave : undefined}
                        showBookmark={!!token}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

        {/* =================== HACKATHONS TAB =================== */}
        {activeTab === "hackathons" && (
          <>
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search hackathons by name, theme, location..."
                value={hackSearch}
                onChange={(e) => setHackSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 text-sm"
              />
            </div>

            {/* Source Filter */}
            <div className="mb-4 flex items-center gap-3">
              <Filter size={20} className="text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {["all", "devfolio", "mlh", "devpost", "unstop"].map((source) => (
                  <button
                    key={source}
                    onClick={() => setHackFilter(source)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      hackFilter === source
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-800/50 border border-white/10 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    {source === "all"
                      ? "All Sources"
                      : source.charAt(0).toUpperCase() + source.slice(1)}
                    {source !== "all" && (
                      <span className="ml-2 text-xs opacity-70">
                        ({hackathons.filter((h) => h.source === source).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-6 flex items-center gap-3">
              <MapPin size={20} className="text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {["all", "bengaluru", "delhi", "mumbai", "hyderabad", "chennai"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocationFilter(loc)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      locationFilter === loc
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-800/50 border border-white/10 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    {loc === "all" ? "All Locations" : loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </button>
                ))}
              </div>
            </div>

          {hackLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {hackError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
              {hackError}
            </div>
          )}

          {!hackLoading && !hackError && filteredHackathons.length === 0 && (
            <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-white/5">
              <Rocket size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">No hackathons found</h3>
              <p className="text-gray-500 mt-2">Try refreshing or check back later</p>
            </div>
          )}

            {!hackLoading && filteredHackathons.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHackathons.map((hack) => (
                  <HackathonCard
                    key={hack.id}
                    hackathon={hack}
                    isSaved={savedHackIds.has(hack.id)}
                    onToggleSave={token ? toggleSaveHackathon : undefined}
                    showBookmark={!!token}
                  />
                ))}
              </div>
            )}
        </>
      )}

      {/* =================== HISTORY TAB =================== */}
      {activeTab === "history" && <ContestHistory embedded />}
    </div>
  );
}

/* =================== Countdown Hook =================== */
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 60000); // update every minute
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function calcTimeLeft(target: Date): { days: number; hours: number; mins: number; passed: boolean } {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, passed: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins, passed: false };
}

/* =================== Hackathon Card =================== */
function HackathonCard({
  hackathon,
  isSaved,
  onToggleSave,
  showBookmark,
}: {
  hackathon: Hackathon;
  isSaved?: boolean;
  onToggleSave?: (hack: Hackathon) => void;
  showBookmark?: boolean;
}) {
  const sc = SOURCE_COLORS[hackathon.source] || SOURCE_COLORS.devfolio;
  const mode = MODE_BADGE[hackathon.mode] || MODE_BADGE.online;

  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  const now = new Date();
  const isLive = now >= startDate && now <= endDate;
  const countdown = useCountdown(startDate);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
      {/* Top bar */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/5">
        <span
          className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}
        >
          {hackathon.source}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${mode.color}`}
          >
            {hackathon.mode === "online" ? (
              <Globe size={12} className="inline mr-1" />
            ) : (
              <MapPin size={12} className="inline mr-1" />
            )}
            {mode.label}
          </span>
          {isLive && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {hackathon.logo && (
          <img
            src={hackathon.logo}
            alt=""
            className="w-12 h-12 rounded-xl object-cover mb-3 bg-white/5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {hackathon.name}
        </h3>

        {hackathon.tagline && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{hackathon.tagline}</p>
        )}

        {/* Countdown Timer */}
        {!isLive && !countdown.passed && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
            <Clock size={14} className="text-indigo-400 shrink-0" />
            <span className="text-xs text-indigo-300 font-medium">
              Starts in{" "}
              {countdown.days > 0 && <span className="font-bold">{countdown.days}d </span>}
              <span className="font-bold">{countdown.hours}h </span>
              <span className="font-bold">{countdown.mins}m</span>
            </span>
          </div>
        )}

        {/* Info grid */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={14} className="text-gray-500 shrink-0" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>

          {hackathon.location && hackathon.location !== "Online" && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin size={14} className="text-gray-500 shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
          )}

          {hackathon.prizes && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <Trophy size={14} className="shrink-0" />
              <span>{hackathon.prizes}</span>
            </div>
          )}

          {hackathon.participants && hackathon.participants > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users size={14} className="text-gray-500 shrink-0" />
              <span>{hackathon.participants.toLocaleString()} participants</span>
            </div>
          )}
        </div>

        {/* Themes */}
        {hackathon.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hackathon.themes.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/15"
              >
                {t}
              </span>
            ))}
            {hackathon.themes.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-gray-700/50 text-gray-400">
                +{hackathon.themes.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Action */}
        <div className="flex gap-2">
          <a
            href={hackathon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm"
          >
            <Rocket size={16} />
            <span>{isLive ? "Join Now" : "Learn More"}</span>
            <ExternalLink size={14} />
          </a>
          {showBookmark && onToggleSave && (
            <button
              onClick={() => onToggleSave(hackathon)}
              className={`px-3 py-2.5 rounded-xl border transition-all ${
                isSaved
                  ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                  : "bg-gray-800/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}
              title={isSaved ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
