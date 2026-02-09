import React from "react";
import { Calendar, Clock, Users, ExternalLink, Trophy, Bookmark } from "lucide-react";

interface ContestCardProps {
    contest: {
        _id: string;
        name: string;
        platform: "codeforces" | "codechef" | "leetcode" | "atcoder";
        startTime: string;
        duration: number; // in seconds
        url: string;
        phase?: string;
        type?: string;
        participants?: number;
    };
    isSaved?: boolean;
    onToggleSave?: (contest: ContestCardProps["contest"]) => void;
    showBookmark?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
    codeforces: "from-red-500 to-red-600",
    codechef: "from-amber-600 to-amber-700",
    leetcode: "from-yellow-500 to-yellow-600",
    atcoder: "from-purple-500 to-purple-600",
};

const PLATFORM_LOGOS: Record<string, string> = {
    codeforces: "🔴",
    codechef: "🟠",
    leetcode: "🟨",
    atcoder: "🟣",
};

export default function ContestCard({ contest, isSaved, onToggleSave, showBookmark }: ContestCardProps) {
    const startTime = new Date(contest.startTime);
    const now = new Date();
    const isUpcoming = startTime > now;
    const timeUntil = startTime.getTime() - now.getTime();

    // Calculate time until contest
    const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

    // Format duration
    const durationHours = Math.floor(contest.duration / 3600);
    const durationMinutes = Math.floor((contest.duration % 3600) / 60);

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl`}
        >
            {/* Platform Header */}
            <div
                className={`bg-gradient-to-r ${PLATFORM_COLORS[contest.platform]} text-white px-6 py-3 flex items-center justify-between`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{PLATFORM_LOGOS[contest.platform]}</span>
                    <span className="font-bold uppercase text-sm tracking-wider">
                        {contest.platform}
                    </span>
                </div>
                {contest.type && (
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                        {contest.type}
                    </span>
                )}
                {showBookmark && onToggleSave && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleSave(contest);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                            isSaved
                                ? "bg-white/20 text-white"
                                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                        }`}
                        title={isSaved ? "Remove from saved" : "Save contest"}
                    >
                        <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                )}
            </div>

            {/* Contest Info */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">
                    {contest.name}
                </h3>

                {/* Countdown Timer */}
                {isUpcoming && timeUntil > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-2">
                            <Clock size={16} />
                            <span>Starts in</span>
                        </div>
                        <div className="flex gap-3 text-center">
                            {days > 0 && (
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {days}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {days === 1 ? "day" : "days"}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {hours}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">hrs</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {minutes}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">min</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Start Time */}
                    <div className="flex items-start gap-2">
                        <Calendar size={18} className="text-gray-400 mt-1" />
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Start Time
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {startTime.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                {startTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-2">
                        <Clock size={18} className="text-gray-400 mt-1" />
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Duration
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {durationHours > 0 && `${durationHours}h `}
                                {durationMinutes}m
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participants */}
                {contest.participants && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <Users size={16} />
                        <span>{contest.participants.toLocaleString()} participants</span>
                    </div>
                )}

                {/* Action Button */}
                <a
                    href={contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${PLATFORM_COLORS[contest.platform]} text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105`}
                >
                    <Trophy size={18} />
                    <span>View Contest</span>
                    <ExternalLink size={16} />
                </a>
            </div>
        </div>
    );
}
