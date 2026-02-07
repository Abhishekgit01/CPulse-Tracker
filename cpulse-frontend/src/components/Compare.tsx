import { useState } from "react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { UserStats } from "../components/PersonalGrowth";

interface CompareData {
    user1: UserStats | null;
    user2: UserStats | null;
}

export default function Compare() {
    const [handle1, setHandle1] = useState("");
    const [handle2, setHandle2] = useState("");
    const [platform, setPlatform] = useState("codeforces");

    const [data, setData] = useState<CompareData>({ user1: null, user2: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCompare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!handle1 || !handle2) return;

        setLoading(true);
        setError("");
        setData({ user1: null, user2: null });

        try {
            // Fetch both users in parallel using the unified metrics endpoint
            const [res1, res2] = await Promise.all([
                axios.get(`/api/metrics/${platform}/${handle1}`),
                axios.get(`/api/metrics/${platform}/${handle2}`),
            ]);

            setData({
                user1: res1.data,
                user2: res2.data,
            });
        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch data. Check handles and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Merge history for chart
    const getChartData = () => {
        if (!data.user1 || !data.user2) return [];

        const history1 = data.user1.history || [];
        const history2 = data.user2.history || [];

        const map = new Map<string, any>();

        history1.forEach((pt: any) => {
            if (!map.has(pt.date)) map.set(pt.date, { date: pt.date });
            map.get(pt.date).user1 = pt.score;
        });

        history2.forEach((pt: any) => {
            if (!map.has(pt.date)) map.set(pt.date, { date: pt.date });
            map.get(pt.date).user2 = pt.score;
        });

        return Array.from(map.values()).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    const chartData = getChartData();

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* HEADER */}
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
                    ⚔️ Head-to-Head Comparison
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Battle of the Algorithms
                </p>
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleCompare} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end">

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Platform</label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 outline-none"
                    >
                        <option value="codeforces">Codeforces</option>
                        <option value="codechef">CodeChef</option>
                        <option value="leetcode">LeetCode</option>
                    </select>
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contender 1</label>
                    <input
                        value={handle1}
                        onChange={(e) => setHandle1(e.target.value)}
                        placeholder="Handle 1 (e.g. tourist)"
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                </div>

                <div className="flex items-center justify-center p-2 text-2xl font-bold text-gray-400">
                    VS
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contender 2</label>
                    <input
                        value={handle2}
                        onChange={(e) => setHandle2(e.target.value)}
                        placeholder="Handle 2 (e.g. Benq)"
                        className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-red-500 transition"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                    {loading ? "Fighting..." : "FIGHT!"}
                </button>
            </form>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg text-center">
                    {error}
                </div>
            )}

            {/* RESULTS */}
            {data.user1 && data.user2 && (
                <div className="space-y-8 animate-fade-in-up">

                    {/* TALE OF THE TAPE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* USER 1 CARD */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-blue-500">1</div>
                            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 relative z-10">{data.user1.handle}</h2>
                            <div className="mt-4 space-y-2 relative z-10">
                                <div className="text-4xl font-extrabold text-gray-800 dark:text-white">
                                    {data.user1.rating}
                                </div>
                                <div className="text-sm text-gray-500">Current Rating</div>
                            </div>
                            {/* Winner Badge Logic */}
                            {((data.user1.rating || 0) > (data.user2.rating || 0)) && (
                                <div className="mt-4 inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-sm">
                                    🏆 RATING LEADER
                                </div>
                            )}
                        </div>

                        {/* STATS COMPARISON MIDDLE */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center flex flex-col justify-center space-y-4">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-gray-400">Max Rating</div>
                                <div className="flex justify-between items-center text-lg font-bold px-4 mt-1">
                                    <span className={(data.user1.maxRating || 0) > (data.user2.maxRating || 0) ? "text-green-500" : ""}>{data.user1.maxRating || "N/A"}</span>
                                    <span className="text-gray-300"> vs </span>
                                    <span className={(data.user2.maxRating || 0) > (data.user1.maxRating || 0) ? "text-green-500" : ""}>{data.user2.maxRating || "N/A"}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="text-xs uppercase tracking-widest text-gray-400">Problems Solved</div>
                                <div className="flex justify-between items-center text-lg font-bold px-4 mt-1">
                                    <span className={(data.user1.totalSolved || 0) > (data.user2.totalSolved || 0) ? "text-green-500" : ""}>{data.user1.totalSolved || data.user1.problemsSolved || "N/A"}</span>
                                    <span className="text-gray-300"> vs </span>
                                    <span className={(data.user2.totalSolved || 0) > (data.user1.totalSolved || 0) ? "text-green-500" : ""}>{data.user2.totalSolved || data.user2.problemsSolved || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* USER 2 CARD */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl border border-red-200 dark:border-red-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-red-500">2</div>
                            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 relative z-10">{data.user2.handle}</h2>
                            <div className="mt-4 space-y-2 relative z-10">
                                <div className="text-4xl font-extrabold text-gray-800 dark:text-white">
                                    {data.user2.rating || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">Current Rating</div>
                            </div>
                            {/* Winner Badge Logic */}
                            {((data.user2.rating || 0) > (data.user1.rating || 0)) && (
                                <div className="mt-4 inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-sm">
                                    🏆 RATING LEADER
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-6 dark:text-white">Rating History Comparison</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#888" style={{ fontSize: '12px' }} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="user1" name={data.user1.handle} stroke="#3b82f6" strokeWidth={3} dot={false} connectNulls />
                                    <Line type="monotone" dataKey="user2" name={data.user2.handle} stroke="#ef4444" strokeWidth={3} dot={false} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
