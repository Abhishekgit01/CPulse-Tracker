import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts';
import { Target, Sparkles, Brain, Loader2 } from 'lucide-react';

interface RadarData {
    subject: string;
    A: number;
    fullMark: number;
}

interface RadarResponse {
    radarData: RadarData[];
    summary: string;
}

export default function MasteryRadar({ handle, platform }: { handle: string; platform: string }) {
    const [data, setData] = useState<RadarData[]>([]);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRadarData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/radar/${platform}/${handle}`);
                setData(res.data.radarData);
                setSummary(res.data.summary);
            } catch (err) {
                console.error("Radar Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (handle && platform === 'codeforces') {
            fetchRadarData();
        } else {
            setLoading(false);
        }
    }, [handle, platform]);

    if (platform !== 'codeforces') return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative group">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
                    <Target size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Mastery Radar</h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Skill Distribution</p>
                </div>
            </div>

            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="text-gray-500 font-medium animate-pulse">Analyzing submissions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* CHART */}
                    <div className="h-[350px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="#4f46e5"
                                    fill="#6366f1"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* AI SUMMARY */}
                    <div className="space-y-6 relative">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">
                            <Sparkles size={14} />
                            AI Skill Profile
                        </div>
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 relative">
                            <Brain className="absolute -top-3 -right-3 text-indigo-200 dark:text-indigo-800" size={48} />
                            <div className="prose dark:prose-invert max-w-none">
                                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium space-y-2">
                                    {summary.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Top Domain</p>
                                <p className="font-bold text-gray-900 dark:text-white capitalize">
                                    {[...data].sort((a, b) => b.A - a.A)[0]?.subject || 'N/A'}
                                </p>
                            </div>
                            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                                <p className="font-bold text-indigo-600">Verified</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        </div>
    );
}
