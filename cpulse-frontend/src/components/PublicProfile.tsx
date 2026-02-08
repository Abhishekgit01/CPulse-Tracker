import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { UserProfileData, RewardData, CommunityPost } from "../types";
import ProfileCustomizer from "./ProfileCustomizer";
import RewardsPanel from "./RewardsPanel";
import {
  MapPin,
  Star,
  Award,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Calendar,
  MessageSquare,
  Settings,
  Trophy,
  Zap,
} from "lucide-react";

const FRAME_STYLES: Record<string, string> = {
  none: "",
  bronze: "ring-2 ring-amber-600",
  silver: "ring-2 ring-gray-300",
  gold: "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20",
  diamond: "ring-2 ring-cyan-300 shadow-lg shadow-cyan-300/30",
};

const THEME_STYLES: Record<string, { bg: string; border: string }> = {
  default: { bg: "bg-gray-800/50", border: "border-white/10" },
  midnight: { bg: "bg-[#0a0e1a]", border: "border-blue-900/30" },
  ocean: { bg: "bg-[#0c1929]", border: "border-cyan-800/30" },
  hacker: { bg: "bg-[#0a1a0a]", border: "border-green-800/30" },
  neon: { bg: "bg-[#1a0a2e]", border: "border-purple-600/30" },
  cyberpunk: { bg: "bg-[#1a0a0a]", border: "border-pink-700/30" },
};

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser, token } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [badges, setBadges] = useState<RewardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "rewards" | "customize">("posts");
  const [showCustomizer, setShowCustomizer] = useState(false);

  const isOwnProfile = authUser?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/profiles/${userId}`);
        if (res.data.success) {
          setProfileUser(res.data.user);
          setProfile(res.data.profile);
          setRecentPosts(res.data.recentPosts);
          setBadges(res.data.badges);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!profileUser || !profile) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Profile not found</p>
      </div>
    );
  }

  const themeStyle = THEME_STYLES[profile.theme] || THEME_STYLES.default;
  const frameStyle = FRAME_STYLES[profile.avatarFrame] || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div
        className={`${themeStyle.bg} backdrop-blur-xl border ${themeStyle.border} rounded-2xl overflow-hidden`}
      >
        {/* Banner */}
        <div
          className="h-28 sm:h-36"
          style={{
            background: `linear-gradient(135deg, ${profile.bannerColor}, ${profile.bannerColor}88, #1e1b4b)`,
          }}
        />

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl ${frameStyle}`}
            >
              {(profileUser.displayName || profileUser.email || "U")[0].toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {profileUser.displayName || profileUser.email.split("@")[0]}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} /> {profile.reputation} reputation
                </span>
                <span className="flex items-center gap-1 text-indigo-400">
                  <Zap size={14} /> {profile.points} points
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin size={14} /> {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} /> Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setShowCustomizer(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition"
              >
                <Settings size={14} /> Customize
              </button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-300 text-sm mt-4">{profile.bio}</p>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.skills.map((skill) => (
                <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-3 mt-3">
            {profile.socialLinks?.github && (
              <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Github size={18} />
              </a>
            )}
            {profile.socialLinks?.linkedin && (
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition">
                <Linkedin size={18} />
              </a>
            )}
            {profile.socialLinks?.twitter && (
              <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition">
                <Twitter size={18} />
              </a>
            )}
            {profile.socialLinks?.portfolio && (
              <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition">
                <Globe size={18} />
              </a>
            )}
          </div>

          {/* CP Profiles */}
          {profileUser.cpProfiles?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profileUser.cpProfiles.map((cp: any) => (
                <span
                  key={`${cp.platform}-${cp.handle}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300"
                >
                  <span className="capitalize font-medium">{cp.platform}</span>: {cp.handle}
                </span>
              ))}
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {badges.slice(0, 5).map((badge) => (
                <span
                  key={badge._id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center gap-1"
                >
                  <Award size={12} /> {badge.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 mb-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "posts"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          <MessageSquare size={14} /> Posts ({recentPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === "rewards"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          <Trophy size={14} /> Rewards
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-2">
          {recentPosts.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No posts yet</p>
          ) : (
            recentPosts.map((post: any) => (
              <Link
                key={post._id}
                to={`/community/${post._id}`}
                className="block bg-gray-800/30 border border-white/5 rounded-lg p-3 hover:border-white/15 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${
                      post.type === "recruitment"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}
                  >
                    {post.type}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white">{post.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{post.score} points</span>
                  <span>{post.commentCount} comments</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "rewards" && (
        <RewardsPanel userId={userId!} isOwn={isOwnProfile} />
      )}

      {/* Customizer Modal */}
      {showCustomizer && isOwnProfile && profile && (
        <ProfileCustomizer
          profile={profile}
          onClose={() => setShowCustomizer(false)}
          onSaved={(updated) => {
            setProfile(updated);
            setShowCustomizer(false);
          }}
        />
      )}
    </div>
  );
}
