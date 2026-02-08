import { useEffect, useState } from "react";
import api from "../api/axios";
import ContestCard from "./ContestCard";
import ContestHistory from "./ContestHistory";
import { Calendar, Filter, RefreshCw, TrendingUp, Trophy } from "lucide-react";

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

type Tab = "upcoming" | "history";

export default function ContestCalendar() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("upcoming");

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

    useEffect(() => {
        fetchContests();
    }, []);

    // Filter contests when platform changes
    useEffect(() => {
        if (selectedPlatform === "all") {
            setFilteredContests(contests);
        } else {
            setFilteredContests(contests.filter((c) => c.platform === selectedPlatform));
        }
    }, [selectedPlatform, contests]);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin text-6xl">&#9881;&#65039;</div>
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
                            Contests
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Upcoming contests and your contest history
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

                {/* Stats Bar - only for upcoming tab */}
                {activeTab === "upcoming" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-indigo-400">
                                {platformCounts.all}
                            </div>
                            <div className="text-sm text-gray-400">Total Contests</div>
                        </div>
                        <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-red-400">
                                {platformCounts.codeforces}
                            </div>
                            <div className="text-sm text-gray-400">Codeforces</div>
                        </div>
                        <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-amber-400">
                                {platformCounts.codechef}
                            </div>
                            <div className="text-sm text-gray-400">CodeChef</div>
                        </div>
                        <div className="bg-gray-800/50 border border-white/10 p-4 rounded-xl">
                            <div className="text-3xl font-bold text-yellow-400">
                                {platformCounts.leetcode}
                            </div>
                            <div className="text-sm text-gray-400">LeetCode</div>
                        </div>
                    </div>
                )}
            </div>

            {/* =================== UPCOMING TAB =================== */}
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
                                    className={`px-4 py-2 rounded-lg font-medium transition ${selectedPlatform === platform
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Contests List */}
                    {filteredContests.length === 0 ? (
                        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-white/5">
                            <TrendingUp size={64} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400">
                                No upcoming contests found
                            </h3>
                            <p className="text-gray-500 mt-2">
                                Try selecting a different platform or refresh the data
                            </p>
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
                                            <ContestCard key={contest._id} contest={contest} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* =================== HISTORY TAB =================== */}
            {activeTab === "history" && (
                <ContestHistory embedded />
            )}
        </div>
    );
}
