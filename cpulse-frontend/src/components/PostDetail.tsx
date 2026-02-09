import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { CommunityPost, CommunityComment } from "../types";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Users,
  ArrowLeft,
  Send,
  Trash2,
  Clock,
} from "lucide-react";

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

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/posts/${id}`);
        if (res.data.success) {
          setPost(res.data.post);
          setComments(res.data.comments);
        }
      } catch {
        navigate("/community");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id, navigate]);

  const handleVote = async (vote: "up" | "down" | "none") => {
    if (!token || !post) return;
    try {
      const res = await api.post(`/api/posts/${post._id}/vote`, { vote });
      if (res.data.success) {
        setPost((prev) =>
          prev ? { ...prev, score: res.data.score, upvoteCount: res.data.upvoteCount, downvoteCount: res.data.downvoteCount } : prev
        );
      }
    } catch {}
  };

  const handleCommentVote = async (commentId: string, vote: "up" | "down" | "none") => {
    if (!token) return;
    try {
      const res = await api.post(`/api/posts/comments/${commentId}/vote`, { vote });
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, score: res.data.score } : c))
        );
      }
    } catch {}
  };

  const handleSubmitComment = async () => {
    if (!token || !post || !newComment.trim()) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/api/posts/${post._id}/comments`, {
        content: newComment.trim(),
        parentId: replyTo,
      });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
        setNewComment("");
        setReplyTo(null);
      }
    } catch {}
    finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/posts/${post._id}`);
      navigate("/community");
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/posts/comments/${commentId}`);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: "[deleted]", isDeleted: true } : c))
      );
      setPost((prev) => (prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) } : prev));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!post) return null;

  const hasUpvoted = user?.id && post.upvotes?.includes(user.id);
  const hasDownvoted = user?.id && post.downvotes?.includes(user.id);
  const isAuthor = user?.id === post.author?._id;

  // Build comment tree
  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);
  const repliesMap: Record<string, CommunityComment[]> = {};
  replies.forEach((r) => {
    if (r.parentId) {
      if (!repliesMap[r.parentId]) repliesMap[r.parentId] = [];
      repliesMap[r.parentId].push(r);
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link to="/community" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition">
        <ArrowLeft size={16} /> Back to Community
      </Link>

      {/* Post */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex gap-4">
          {/* Votes */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={() => handleVote(hasUpvoted ? "none" : "up")}
              className={`p-1.5 rounded-lg transition ${
                hasUpvoted ? "text-indigo-400 bg-indigo-500/20" : "text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10"
              }`}
            >
              <ChevronUp size={22} />
            </button>
            <span className={`text-lg font-bold ${post.score > 0 ? "text-indigo-400" : post.score < 0 ? "text-red-400" : "text-gray-500"}`}>
              {post.score}
            </span>
            <button
              onClick={() => handleVote(hasDownvoted ? "none" : "down")}
              className={`p-1.5 rounded-lg transition ${
                hasDownvoted ? "text-red-400 bg-red-500/20" : "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <ChevronDown size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                <Link to={`/profile/${post.author._id}`} className="text-sm text-gray-400 hover:text-indigo-400 transition">
                  @{post.author.displayName || post.author.email.split("@")[0]}
                </Link>
              )}
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Clock size={11} /> {timeAgo(post.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">{post.title}</h1>
            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</div>

            {/* Recruitment details */}
            {post.type === "recruitment" && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.hackathonName && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/15">
                    {post.hackathonName}
                  </span>
                )}
                {post.teamSize && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-700/50 text-gray-300 flex items-center gap-1">
                    <Users size={11} /> Team of {post.teamSize}
                  </span>
                )}
                {post.rolesNeeded?.map((role) => (
                  <span key={role} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
                    {role}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MessageSquare size={13} /> {post.commentCount} comments
              </span>
              <span className="flex items-center gap-1">
                <Eye size={13} /> {post.viewCount} views
              </span>
              {isAuthor && (
                <button onClick={handleDeletePost} className="flex items-center gap-1 text-red-400/60 hover:text-red-400 transition">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      {token && !post.isLocked && (
        <div className="mt-6 bg-gray-800/30 border border-white/10 rounded-xl p-4">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
              <span>Replying to a comment</span>
              <button onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-300">
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="flex-1 px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
            />
            <button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              className="px-4 self-end py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-bold text-white mb-4">
          Comments ({post.commentCount})
        </h3>

        {topLevel.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        )}

        {topLevel.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            replies={repliesMap[comment._id] || []}
            userId={user?.id}
            onVote={handleCommentVote}
            onReply={(id) => { setReplyTo(id); }}
            onDelete={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  userId,
  onVote,
  onReply,
  onDelete,
  depth = 0,
}: {
  comment: CommunityComment;
  replies: CommunityComment[];
  userId?: string;
  onVote: (id: string, vote: "up" | "down" | "none") => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const hasUpvoted = userId && comment.upvotes?.includes(userId);
  const hasDownvoted = userId && comment.downvotes?.includes(userId);
  const isAuthor = userId === comment.author?._id;

  return (
    <div className={depth > 0 ? "ml-6 border-l border-white/5 pl-4" : ""}>
      <div className="bg-gray-800/30 border border-white/5 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          {comment.author && (
            <Link to={`/profile/${comment.author._id}`} className="text-xs text-gray-400 hover:text-indigo-400 font-medium transition">
              @{comment.author.displayName || comment.author.email.split("@")[0]}
            </Link>
          )}
          <span className="text-xs text-gray-600">{timeAgo(comment.createdAt)}</span>
        </div>

        <p className={`text-sm ${comment.isDeleted ? "text-gray-600 italic" : "text-gray-300"}`}>
          {comment.content}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onVote(comment._id, hasUpvoted ? "none" : "up")}
              className={`p-0.5 rounded transition ${hasUpvoted ? "text-indigo-400" : "text-gray-600 hover:text-indigo-400"}`}
            >
              <ChevronUp size={14} />
            </button>
            <span className={`font-medium ${comment.score > 0 ? "text-indigo-400" : comment.score < 0 ? "text-red-400" : "text-gray-600"}`}>
              {comment.score}
            </span>
            <button
              onClick={() => onVote(comment._id, hasDownvoted ? "none" : "down")}
              className={`p-0.5 rounded transition ${hasDownvoted ? "text-red-400" : "text-gray-600 hover:text-red-400"}`}
            >
              <ChevronDown size={14} />
            </button>
          </div>
          {!comment.isDeleted && userId && (
            <button onClick={() => onReply(comment._id)} className="text-gray-500 hover:text-gray-300 transition">
              Reply
            </button>
          )}
          {isAuthor && !comment.isDeleted && (
            <button onClick={() => onDelete(comment._id)} className="text-red-400/60 hover:text-red-400 transition">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {replies.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          replies={[]}
          userId={userId}
          onVote={onVote}
          onReply={onReply}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
