import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Target, TrendingUp } from "lucide-react";

interface LivePulseProps {
    analysis: {
        bio?: string;
        vibe?: string;
        vibeQuote?: string;
        strength?: string;
        weakness?: string;
        roadmapTip?: string;
    } | null;
}

const LivePulse: React.FC<LivePulseProps> = ({ analysis }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const messages = analysis ? [
        { icon: <Sparkles className="text-yellow-400" />, text: analysis.vibeQuote },
        { icon: <TrendingUp className="text-emerald-400" />, text: `Strength: ${analysis.strength}` },
        { icon: <Target className="text-indigo-400" />, text: analysis.roadmapTip },
        { icon: <Zap className="text-orange-400" />, text: "Pulse Score rising! Keep the momentum." }
    ].filter(msg => msg.text) : [];

    useEffect(() => {
        if (messages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [messages.length]);

    if (!analysis || messages.length === 0) return null;

    return (
        <div className="relative overflow-hidden bg-indigo-900/10 dark:bg-indigo-900/20 border-y border-indigo-500/10 py-3 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Live Pulse
                    </div>

                    <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-800"></div>

                    <div key={currentIndex} className="flex items-center gap-3 animate-pulse-slow">
                        {messages[currentIndex].icon}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">
                            "{messages[currentIndex].text}"
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePulse;
