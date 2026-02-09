import { Link } from "react-router-dom";
import { CommunityPost } from "../types";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Users,
  Pin,
  Lock,
} from "lucide-react";

interface PostCardProps {
  post: CommunityPost;
  onVote: (postId: string, vote: "up" | "down" | "none") => void;
  userId?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostCard({ post, onVote, userId }: PostCardProps) {
  const hasUpvoted = userId && post.upvotes?.includes(userId);
  const hasDownvoted = userId && post.downvotes?.includes(userId);

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-all group">
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 px-3 py-4">
          <button
            onClick={() => onVote(post._id, hasUpvoted ? "none" : "up")}
            className={`p-1 rounded transition ${
              hasUpvoted ? "text-indigo-400 bg-indigo-500/20" : "text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10"
            }`}
          >
            <ChevronUp size={20} />
          </button>
          <span className={`text-sm font-bold ${post.score > 0 ? "text-indigo-400" : post.score < 0 ? "text-red-400" : "text-gray-500"}`}>
            {post.score}
          </span>
          <button
            onClick={() => onVote(post._id, hasDownvoted ? "none" : "down")}
            className={`p-1 rounded transition ${
              hasDownvoted ? "text-red-400 bg-red-500/20" : "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 py-3 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {post.isPinned && (
              <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                <Pin size={10} /> Pinned
              </span>
            )}
            {post.isLocked && (
              <span className="text-xs text-red-400 flex items-center gap-0.5">
                <Lock size={10} /> Locked
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                post.type === "recruitment"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
            >
              {post.type === "recruitment" ? "Recruitment" : "Discussion"}
            </span>
            {post.author && (
              <Link
                to={`/profile/${post.author._id}`}
                className="text-xs text-gray-400 hover:text-indigo-400 transition"
              >
                @{post.author.displayName || post.author.email.split("@")[0]}
              </Link>
            )}
            <span className="text-xs text-gray-600">{timeAgo(post.createdAt)}</span>
          </div>

          <Link
            to={`/community/${post._id}`}
            className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2"
          >
            {post.title}
          </Link>

          {post.content && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.content}</p>
          )}

          {/* Recruitment details */}
          {post.type === "recruitment" && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.hackathonName && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/15">
                  {post.hackathonName}
                </span>
              )}
              {post.teamSize && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-700/50 text-gray-300 flex items-center gap-1">
                  <Users size={10} /> Team of {post.teamSize}
                </span>
              )}
              {post.rolesNeeded?.map((role) => (
                <span
                  key={role}
                  className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/15"
                >
                  {role}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
            <Link to={`/community/${post._id}`} className="flex items-center gap-1 hover:text-gray-300 transition">
              <MessageSquare size={13} />
              {post.commentCount} comments
            </Link>
            <span className="flex items-center gap-1">
              <Eye size={13} />
              {post.viewCount} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
