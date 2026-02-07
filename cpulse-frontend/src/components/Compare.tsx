import { useState } from "react";
import api from "../api/axios";
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
            const [res1, res2] = await Promise.all([
                api.get(`/api/metrics/${platform}/${handle1}`),
                api.get(`/api/metrics/${platform}/${handle2}`),
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            {/* HEADER */}
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Head-to-Head Comparison
                </h1>
                <p className="text-gray-400">
                    Battle of the Algorithms
                </p>
            </div>

            {/* INPUT FORM */}
            <div className="glass-card rounded-2xl">
                <form onSubmit={handleCompare} className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-end w-full">

                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1 text-gray-300">Platform</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="glass-input w-full p-3 rounded-xl text-white focus:outline-none"
                        >
                            <option value="codeforces">Codeforces</option>
                            <option value="codechef">CodeChef</option>
                            <option value="leetcode">LeetCode</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1 text-gray-300">Contender 1</label>
                        <input
                            value={handle1}
                            onChange={(e) => setHandle1(e.target.value)}
                            placeholder="Handle 1 (e.g. tourist)"
                            className="glass-input w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="hidden md:flex items-center justify-center p-2 text-2xl font-bold text-gray-500">
                        VS
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-1 text-gray-300">Contender 2</label>
                        <input
                            value={handle2}
                            onChange={(e) => setHandle2(e.target.value)}
                            placeholder="Handle 2 (e.g. Benq)"
                            className="glass-input w-full p-3 rounded-xl text-white placeholder-gray-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
                    >
                        {loading ? "Fighting..." : "FIGHT!"}
                    </button>
                </form>
            </div>

            {error && (
                <div className="glass rounded-xl p-4 text-center border-red-500/30 text-red-400">
                    {error}
                </div>
            )}

            {/* RESULTS */}
            {data.user1 && data.user2 && (
                <div className="space-y-8">

                    {/* TALE OF THE TAPE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

                        {/* USER 1 CARD */}
                        <div className="glass-card p-6 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black text-blue-500">1</div>
                            <h2 className="text-2xl font-bold text-blue-400 relative z-10">{data.user1.handle}</h2>
                            <div className="mt-4 space-y-2 relative z-10">
                                <div className="text-4xl font-extrabold text-white">
                                    {data.user1.rating}
                                </div>
                                <div className="text-sm text-gray-500">Current Rating</div>
                            </div>
                            {((data.user1.rating || 0) > (data.user2.rating || 0)) && (
                                <div className="mt-4 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                                    RATING LEADER
                                </div>
                            )}
                        </div>

                        {/* STATS COMPARISON MIDDLE */}
                        <div className="glass-card p-6 rounded-2xl text-center flex flex-col justify-center space-y-4">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-gray-500">Max Rating</div>
                                <div className="flex justify-between items-center text-lg font-bold px-4 mt-1">
                                    <span className={(data.user1.maxRating || 0) > (data.user2.maxRating || 0) ? "text-green-400" : "text-white"}>{data.user1.maxRating || "N/A"}</span>
                                    <span className="text-gray-600"> vs </span>
                                    <span className={(data.user2.maxRating || 0) > (data.user1.maxRating || 0) ? "text-green-400" : "text-white"}>{data.user2.maxRating || "N/A"}</span>
                                </div>
                            </div>
                            <div className="border-t border-white/5 pt-4">
                                <div className="text-xs uppercase tracking-widest text-gray-500">Problems Solved</div>
                                <div className="flex justify-between items-center text-lg font-bold px-4 mt-1">
                                    <span className={(data.user1.totalSolved || 0) > (data.user2.totalSolved || 0) ? "text-green-400" : "text-white"}>{data.user1.totalSolved || data.user1.problemsSolved || "N/A"}</span>
                                    <span className="text-gray-600"> vs </span>
                                    <span className={(data.user2.totalSolved || 0) > (data.user1.totalSolved || 0) ? "text-green-400" : "text-white"}>{data.user2.totalSolved || data.user2.problemsSolved || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* USER 2 CARD */}
                        <div className="glass-card p-6 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black text-red-500">2</div>
                            <h2 className="text-2xl font-bold text-red-400 relative z-10">{data.user2.handle}</h2>
                            <div className="mt-4 space-y-2 relative z-10">
                                <div className="text-4xl font-extrabold text-white">
                                    {data.user2.rating || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">Current Rating</div>
                            </div>
                            {((data.user2.rating || 0) > (data.user1.rating || 0)) && (
                                <div className="mt-4 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                                    RATING LEADER
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="glass-card p-4 sm:p-6 rounded-2xl">
                        <div className="w-full">
                            <h3 className="text-xl font-bold mb-6 text-white">Rating History Comparison</h3>
                            <div className="h-64 sm:h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="date" stroke="#555" style={{ fontSize: '12px' }} />
                                        <YAxis stroke="#555" style={{ fontSize: '12px' }} domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(17,24,39,0.9)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="user1" name={data.user1.handle} stroke="#3b82f6" strokeWidth={3} dot={false} connectNulls />
                                        <Line type="monotone" dataKey="user2" name={data.user2.handle} stroke="#ef4444" strokeWidth={3} dot={false} connectNulls />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
