import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { CommunityPost } from "../types";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import {
  MessageSquare,
  Plus,
  Filter,
  TrendingUp,
  Clock,
  Flame,
  Users,
  X,
} from "lucide-react";

type TabFilter = "all" | "discussion" | "recruitment" | "my";
type SortMode = "new" | "hot" | "top";

export default function Community() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("new");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { sort: sortMode, page, limit: 20 };
      if (tabFilter === "discussion" || tabFilter === "recruitment") params.type = tabFilter;
      if (tabFilter === "my" && user) params.author = user.id;

      const res = await api.get("/api/posts", { params });
      if (res.data.success) {
        setPosts(res.data.posts);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [sortMode, page, tabFilter, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
  }, [tabFilter, sortMode]);

  const handlePostCreated = () => {
    setShowCreate(false);
    setTabFilter("all");
    setSortMode("new");
    setPage(1);
    fetchPosts();
  };

  const handleVote = async (postId: string, vote: "up" | "down" | "none") => {
    if (!token) return;
    try {
      const res = await api.post(`/api/posts/${postId}/vote`, { vote });
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, score: res.data.score, upvoteCount: res.data.upvoteCount, downvoteCount: res.data.downvoteCount }
              : p
          )
        );
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.error("Session expired, redirecting to login");
      }
    }
  };

  const tabs: { key: TabFilter; label: string; icon: any }[] = [
    { key: "all", label: "All", icon: MessageSquare },
    { key: "discussion", label: "Discussions", icon: MessageSquare },
    { key: "recruitment", label: "Recruitment", icon: Users },
    ...(token ? [{ key: "my" as TabFilter, label: "My Posts", icon: Filter }] : []),
  ];

  const sorts: { key: SortMode; label: string; icon: any }[] = [
    { key: "new", label: "New", icon: Clock },
    { key: "hot", label: "Hot", icon: Flame },
    { key: "top", label: "Top", icon: TrendingUp },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <MessageSquare className="text-indigo-400" size={36} />
            Community
          </h1>
          <p className="text-gray-400 mt-1">Discuss, find teammates, and connect</p>
        </div>
        {token && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm"
          >
            <Plus size={18} />
            New Post
          </button>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create Post</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <CreatePost onCreated={handlePostCreated} onCancel={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTabFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tabFilter === key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500">Sort:</span>
        {sorts.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSortMode(key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortMode === key
                ? "bg-white/10 text-white border border-white/20"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-white/5">
          <MessageSquare size={56} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No posts yet</h3>
          <p className="text-gray-500 mt-1">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onVote={handleVote} userId={user?.id} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                page === p
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800/50 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
