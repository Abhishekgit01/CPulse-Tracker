import React from 'react';
import { Briefcase, CheckCircle2, Lock, Rocket, Sparkles, Target, Trophy } from 'lucide-react';

interface Tier {
    name: string;
    minScore: number;
    color: string;
    companies: string[];
    icon: React.ReactNode;
}

const TIERS: Tier[] = [
    {
        name: "Trainee",
        minScore: 0,
        color: "bg-slate-400",
        companies: ["Service-based Startups", "Local Tech Firms"],
        icon: <Briefcase size={18} />
    },
    {
        name: "Product Knight",
        minScore: 600,
        color: "bg-blue-500",
        companies: ["Zomato", "Swiggy", "PhonePe", "Razorpay"],
        icon: <Rocket size={18} />
    },
    {
        name: "Elite Developer",
        minScore: 1200,
        color: "bg-indigo-600",
        companies: ["Amazon", "Microsoft", "Adobe", "Directi"],
        icon: <Target size={18} />
    },
    {
        name: "Logic Legend",
        minScore: 1800,
        color: "bg-purple-600",
        companies: ["Google", "Meta", "Uber", "Tower Research"],
        icon: <Trophy size={18} />
    },
    {
        name: "Algorithm G.O.A.T",
        minScore: 2400,
        color: "bg-amber-500",
        companies: ["Jane Street", "Hudson River Trading", "DeepMind"],
        icon: <CheckCircle2 size={18} />
    }
];

export default function CareerCompass({ score, aiAdvice }: { score: number, aiAdvice?: string }) {
    const currentTierIndex = [...TIERS].reverse().findIndex(t => score >= t.minScore);
    const currentTier = currentTierIndex === -1 ? TIERS[0] : TIERS[TIERS.length - 1 - currentTierIndex];
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

    const progress = nextTier
        ? ((score - currentTier.minScore) / (nextTier.minScore - currentTier.minScore)) * 100
        : 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Career Compass</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Industry Readiness Mapping</p>
                    </div>
                </div>
                {aiAdvice && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl shadow-lg animate-pulse border-2 border-white/20">
                        <Sparkles size={16} />
                        <span className="text-xs font-black uppercase tracking-tighter">AI Optimized Route</span>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {/* PROGRESS TIER BAR */}
                <div className="relative">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                            Current: {currentTier.name}
                        </span>
                        {nextTier && (
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                Next Goal: {nextTier.name} ({nextTier.minScore})
                            </span>
                        )}
                    </div>
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        {TIERS.map((tier, idx) => {
                            const isPast = score >= (TIERS[idx + 1]?.minScore || 9999);
                            const isCurrent = score >= tier.minScore && score < (TIERS[idx + 1]?.minScore || 9999);

                            return (
                                <div
                                    key={tier.name}
                                    className={`h-full transition-all duration-1000 ${tier.color} ${isPast ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-20'}`}
                                    style={{ width: `${100 / TIERS.length}%` }}
                                />
                            )
                        })}
                    </div>
                    {/* Progress Indicator */}
                    <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <span>0</span>
                        <span>600</span>
                        <span>1200</span>
                        <span>1800</span>
                        <span>2400+</span>
                    </div>
                </div>

                {/* TARGET COMPANIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target size={12} /> Target Recruiters
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {currentTier.companies.map(company => (
                                <span key={company} className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-bold shadow-sm border border-gray-100 dark:border-gray-700">
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={12} /> AI Strategy Roadmap
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {aiAdvice || (score < 1200
                                ? "You have a solid logical foundation. Focus on solving more 'Medium' problems and data structures to unlock FAANG-tier opportunities."
                                : score < 2000
                                    ? "Exceptional skills! Your algorithmic dexterity is high. You should focus on advanced graph algorithms and system design basics for top product labs."
                                    : "You are in the elite percentage of global developers. HFTs and top-tier research labs are your primary playground."
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* LOCKED TIERS PREVIEW */}
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                    {TIERS.map(tier => {
                        const isLocked = score < tier.minScore;
                        return (
                            <div key={tier.name} className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border ${isLocked ? 'grayscale opacity-50 bg-gray-50 border-gray-200' : 'bg-white border-emerald-100 shadow-sm'}`}>
                                <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {isLocked ? <Lock size={16} /> : tier.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">{tier.name}</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{tier.minScore}+ CPScore</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        </div>
    );
}
