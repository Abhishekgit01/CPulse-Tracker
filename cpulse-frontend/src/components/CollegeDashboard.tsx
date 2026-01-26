import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    Trophy,
    BarChart3,
    Sparkles,
    ChevronRight,
    Search,
    School,
    ArrowUpRight,
    TrendingUp,
    LayoutGrid,
    Zap
} from "lucide-react";

interface student {
    handle: string;
    platform: string;
    cpulseRating: number;
    rating: number;
}

interface ClassStats {
    classId: string;
    totalStudents: number;
    avgCPulse: number;
    topPlatform: string;
    platformDistribution: Record<string, number>;
    leaderboard: student[];
}

export default function CollegeDashboard() {
    const [classes, setClasses] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [stats, setStats] = useState<ClassStats | null>(null);
    const [insights, setInsights] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/class/list");
            setClasses(res.data.classes);
            if (res.data.classes.length > 0) {
                handleSelectClass(res.data.classes[0]);
            }
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    const handleSelectClass = async (classId: string) => {
        setSelectedClass(classId);
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/class/${classId}/stats`);
            setStats(res.data);

            // Fetch AI Insights
            setLoadingInsights(true);
            const insightRes = await axios.get(`http://localhost:5000/api/class/${classId}/ai-insights`);
            setInsights(insightRes.data.insights);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
            setLoadingInsights(false);
        }
    };

    const filteredClasses = classes.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-4 md:p-8 text-gray-900 dark:text-gray-100">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER SECTION */}
                <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                <School size={20} />
                                <span className="text-sm font-medium tracking-wider uppercase">Institutional Pulse</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">College Dashboard</h1>
                            <p className="text-indigo-100 max-w-xl text-lg opacity-90">
                                Tracking mastery across classes and celebrating the collective growth of our competitive programming community.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full md:w-64 pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* CLASS LIST SIDEBAR */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest">
                                <LayoutGrid size={14} />
                                Select Class
                            </div>
                            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredClasses.length > 0 ? (
                                    filteredClasses.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => handleSelectClass(c)}
                                            className={`flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all duration-200 group ${selectedClass === c
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <span className="font-semibold">{c}</span>
                                            {selectedClass === c && <ChevronRight size={16} />}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No classes found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-3 space-y-8">
                        {loading ? (
                            <div className="space-y-8 animate-pulse">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />)}
                                </div>
                                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                                <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                            </div>
                        ) : stats ? (
                            <>
                                {/* STATS GRID */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard
                                        icon={<Users className="text-blue-500" />}
                                        label="Total Students"
                                        value={stats.totalStudents}
                                        sub="Enrolled"
                                        color="blue"
                                    />
                                    <StatCard
                                        icon={<TrendingUp className="text-emerald-500" />}
                                        label="Average Score"
                                        value={stats.avgCPulse}
                                        sub="Class Performance"
                                        color="emerald"
                                    />
                                    <StatCard
                                        icon={<Zap className="text-amber-500" />}
                                        label="Top Platform"
                                        value={stats.topPlatform}
                                        sub="Most Active On"
                                        color="amber"
                                        isText
                                    />
                                </div>

                                {/* PERFORMANCE ANALYSIS */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
                                            <Sparkles size={24} />
                                        </div>
                                        <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                            Performance Analysis
                                        </h2>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none relative z-10">
                                        {loadingInsights ? (
                                            <div className="space-y-3 opacity-50">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                                {insights ? insights.split('\n').map((line, i) => (
                                                    <p key={i} className="mb-2">{line}</p>
                                                )) : (
                                                    <p className="italic opacity-70">No analysis available for this class yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* LEADERBOARD TABLE */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                                <Trophy size={20} />
                                            </div>
                                            <h2 className="text-xl font-bold">Top Performers</h2>
                                        </div>
                                        <div className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-widest">
                                            {selectedClass}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                                    <th className="px-8 py-5">Rank</th>
                                                    <th className="px-8 py-5">Student</th>
                                                    <th className="px-8 py-5">Platform</th>
                                                    <th className="px-8 py-5 text-right">Rating</th>
                                                    <th className="px-8 py-5 text-right">Score</th>
                                                    <th className="px-8 py-5"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.leaderboard.length > 0 ? (
                                                    stats.leaderboard.map((student, i) => (
                                                        <tr key={student.handle} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-b last:border-0 border-gray-100 dark:border-gray-700/50">
                                                            <td className="px-8 py-5">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                                        ${i === 0 ? "bg-amber-100 text-amber-700" :
                                                                        i === 1 ? "bg-gray-200 text-gray-700" :
                                                                            i === 2 ? "bg-orange-100 text-orange-700" :
                                                                                "text-gray-400 bg-gray-50 dark:bg-gray-800"}`}>
                                                                    {i + 1}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className="font-semibold text-gray-900 dark:text-gray-100">{student.handle}</span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className={`px-2.5 py-1 rounded-md text-[11px] uppercase font-bold tracking-wide
                                                        ${student.platform === 'codeforces' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                        student.platform === 'leetcode' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                                                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                                                                    {student.platform}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                                                                {student.rating || '-'}
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{student.cpulseRating}</span>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <a
                                                                    href={`/growth/${student.platform}/${student.handle}`}
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                                                                    title="View Profile"
                                                                >
                                                                    <ArrowUpRight size={16} />
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                                                            No students found in this class yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full mb-6">
                                    <School size={48} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Select a Class</h3>
                                <p className="text-gray-500 dark:text-gray-400">Choose a class from the list to view its analytics.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub, color, isText }: any) {
    const colorClasses: any = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {React.cloneElement(icon, { size: 22 })}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <h3 className={`text-3xl font-bold tracking-tight text-gray-900 dark:text-white ${isText ? 'text-xl capitalize' : ''}`}>{value}</h3>
                <p className="text-sm text-gray-500 mt-1">{sub}</p>
            </div>
        </div>
    );
}
