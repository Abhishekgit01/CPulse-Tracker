import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ContestCard from "./ContestCard";
import ContestHistory from "./ContestHistory";
import { Calendar, Filter, RefreshCw, TrendingUp, Bookmark, Trophy } from "lucide-react";

type Tab = "upcoming" | "history";

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

export default function ContestCalendar() {
    const [activeTab, setActiveTab] = useState<Tab>("upcoming");
    const [contests, setContests] = useState<Contest[]>([]);
    const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [refreshing, setRefreshing] = useState(false);
    const [savedContestIds, setSavedContestIds] = useState<Set<string>>(new Set());
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const { token } = useAuth();

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ success: boolean; contests: Contest[] }>(
                "/api/contests"
            );

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

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await api.post("/api/contests/refresh");
            await fetchContests();
        } catch (err) {
            console.error("Error refreshing contests:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchSavedContests = async () => {
        if (!token) return;
        try {
            const res = await api.get("/api/contests/saved");
            if (res.data.success) {
                const ids = new Set<string>(res.data.contests.map((c: any) => c.contestId));
                setSavedContestIds(ids);
            }
        } catch {
            // User may not be logged in
        }
    };

    const handleToggleSave = async (contest: Contest) => {
        if (!token) return;
        const contestId = contest._id;
        if (savedContestIds.has(contestId)) {
            // Unsave
            try {
                await api.delete(`/api/contests/saved/${contestId}`);
                setSavedContestIds((prev) => {
                    const next = new Set(prev);
                    next.delete(contestId);
                    return next;
                });
            } catch (err) {
                console.error("Error removing saved contest:", err);
            }
        } else {
            // Save
            try {
                await api.post("/api/contests/saved", {
                    contestId: contest._id,
                    platform: contest.platform,
                    name: contest.name,
                    startTime: contest.startTime,
                    duration: contest.duration,
                    url: contest.url,
                });
                setSavedContestIds((prev) => new Set(prev).add(contestId));
            } catch (err) {
                console.error("Error saving contest:", err);
            }
        }
    };

    useEffect(() => {
        fetchContests();
        fetchSavedContests();
    }, []); // eslint-disable-line

    // Filter contests when platform or saved filter changes
    useEffect(() => {
        let filtered = contests;
        if (selectedPlatform !== "all") {
            filtered = filtered.filter((c) => c.platform === selectedPlatform);
        }
        if (showSavedOnly) {
            filtered = filtered.filter((c) => savedContestIds.has(c._id));
        }
        setFilteredContests(filtered);
    }, [selectedPlatform, contests, showSavedOnly, savedContestIds]);

    // Group contests by date
    const groupedContests = filteredContests.reduce((acc, contest) => {
        const date = new Date(contest.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(contest);
        return acc;
    }, {} as Record<string, Contest[]>);

    const platformCounts = {
        all: contests.length,
        codeforces: contests.filter((c) => c.platform === "codeforces").length,
        codechef: contests.filter((c) => c.platform === "codechef").length,
        leetcode: contests.filter((c) => c.platform === "leetcode").length,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                            <Calendar className="text-indigo-600 dark:text-indigo-400" size={40} />
                            Contests
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Upcoming contests and your participation history
                        </p>
                    </div>

                    {activeTab === "upcoming" && (
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

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === "upcoming"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
                        }`}
                    >
                        <Calendar size={16} />
                        Upcoming
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
            </div>

            {/* Tab Content */}
            {activeTab === "history" ? (
                <ContestHistory embedded />
            ) : (
                <>
                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin text-6xl">&#9881;&#65039;</div>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Stats Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {platformCounts.all}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Contests</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {platformCounts.codeforces}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Codeforces</div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                        {platformCounts.codechef}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">CodeChef</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {platformCounts.leetcode}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">LeetCode</div>
                                </div>
                            </div>

                            {/* Platform Filter */}
                            <div className="mb-6 flex items-center gap-3">
                                <Filter size={20} className="text-gray-500" />
                                <div className="flex flex-wrap gap-2">
                                    {["all", "codeforces", "codechef", "leetcode"].map((platform) => (
                                        <button
                                            key={platform}
                                            onClick={() => setSelectedPlatform(platform)}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${selectedPlatform === platform
                                                    ? "bg-indigo-600 text-white shadow-md"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
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
                                    {token && (
                                        <button
                                            onClick={() => setShowSavedOnly(!showSavedOnly)}
                                            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                                showSavedOnly
                                                    ? "bg-amber-600 text-white shadow-md"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            }`}
                                        >
                                            <Bookmark size={16} fill={showSavedOnly ? "currentColor" : "none"} />
                                            My Saved
                                            {savedContestIds.size > 0 && (
                                                <span className="text-xs opacity-70">({savedContestIds.size})</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Contests List */}
                            {filteredContests.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <TrendingUp size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                                        No upcoming contests found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-500 mt-2">
                                        Try selecting a different platform or refresh the data
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {Object.entries(groupedContests).map(([date, dateContests]) => (
                                        <div key={date}>
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                                {date}
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {dateContests.map((contest) => (
                                                    <ContestCard
                                                        key={contest._id}
                                                        contest={contest}
                                                        isSaved={savedContestIds.has(contest._id)}
                                                        onToggleSave={handleToggleSave}
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
                </>
            )}
        </div>
    );
}
