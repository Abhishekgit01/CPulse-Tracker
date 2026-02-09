import { useEffect, useState } from "react";
import api from "../api/axios";
import { RewardData } from "../types";
import { Award, Zap, Star, Trophy, Lock } from "lucide-react";

const POINT_MILESTONES = [
  { points: 100, label: "Basic Themes", desc: "Midnight, Ocean themes" },
  { points: 250, label: "Gradient Border", desc: "Gradient profile border" },
  { points: 500, label: "Bronze Frame", desc: "Bronze avatar frame" },
  { points: 750, label: "Premium Themes", desc: "Hacker, Neon, Cyberpunk" },
  { points: 1000, label: "Silver Frame", desc: "Silver avatar frame" },
  { points: 1500, label: "Animated Border", desc: "Animated profile border" },
  { points: 2500, label: "Gold Frame", desc: "Gold avatar frame" },
  { points: 5000, label: "Diamond Frame", desc: "Diamond avatar frame" },
];

interface RewardsPanelProps {
  userId: string;
  isOwn: boolean;
}

export default function RewardsPanel({ userId, isOwn }: RewardsPanelProps) {
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [points, setPoints] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const endpoint = isOwn ? "/api/profiles/me/rewards" : `/api/profiles/${userId}`;
        const res = await api.get(endpoint);
        if (res.data.success) {
          if (isOwn) {
            setRewards(res.data.rewards);
            setPoints(res.data.points);
            setReputation(res.data.reputation);
          } else {
            // For other users, we get it from the profile endpoint
            setPoints(res.data.profile?.points || 0);
            setReputation(res.data.profile?.reputation || 0);
            setRewards(res.data.badges || []);
          }
        }
      } catch (err) {
        console.error("Error fetching rewards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [userId, isOwn]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Find next milestone
  const nextMilestone = POINT_MILESTONES.find((m) => m.points > points);
  const progressPercent = nextMilestone ? Math.min(100, (points / nextMilestone.points) * 100) : 100;

  const badges = rewards.filter((r) => r.type === "badge");
  const pointRewards = rewards.filter((r) => r.type === "points").slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 text-center">
          <Zap className="mx-auto text-indigo-400 mb-1" size={24} />
          <div className="text-2xl font-bold text-white">{points}</div>
          <div className="text-xs text-gray-400">Points</div>
        </div>
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 text-center">
          <Star className="mx-auto text-yellow-400 mb-1" size={24} />
          <div className="text-2xl font-bold text-white">{reputation}</div>
          <div className="text-xs text-gray-400">Reputation</div>
        </div>
      </div>

      {/* Progress to next unlock */}
      {nextMilestone && (
        <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Next unlock: {nextMilestone.label}</span>
            <span className="text-xs text-gray-500">{points}/{nextMilestone.points} pts</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{nextMilestone.desc}</p>
        </div>
      )}

      {/* Milestones */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
          <Trophy size={14} /> Milestones
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POINT_MILESTONES.map((m) => {
            const unlocked = points >= m.points;
            return (
              <div
                key={m.points}
                className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                  unlocked
                    ? "bg-indigo-500/10 border-indigo-500/20"
                    : "bg-gray-800/20 border-white/5 opacity-60"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  unlocked ? "bg-indigo-500/20 text-indigo-400" : "bg-gray-700/50 text-gray-600"
                }`}>
                  {unlocked ? <Award size={16} /> : <Lock size={14} />}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{m.label}</div>
                  <div className="text-xs text-gray-500">{m.points} pts - {m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
            <Award size={14} /> Badges ({badges.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <div
                key={b._id}
                className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs"
                title={b.description}
              >
                <Award size={12} className="inline mr-1" />
                {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent point rewards (own profile only) */}
      {isOwn && pointRewards.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Recent Activity</h4>
          <div className="space-y-1">
            {pointRewards.map((r) => (
              <div key={r._id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-gray-400">{r.description}</span>
                <span className="text-indigo-400 font-medium">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
