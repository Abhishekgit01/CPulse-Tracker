import { useState } from "react";
import api from "../api/axios";
import { MessageSquare, Users, X } from "lucide-react";

interface CreatePostProps {
  onCreated: () => void;
  onCancel: () => void;
}

export default function CreatePost({ onCreated, onCancel }: CreatePostProps) {
  const [type, setType] = useState<"discussion" | "recruitment">("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [hackathonName, setHackathonName] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const body: any = {
        type,
        title: title.trim(),
        content: content.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      };

      if (type === "recruitment") {
        body.hackathonName = hackathonName.trim() || undefined;
        body.teamSize = teamSize;
        body.rolesNeeded = rolesNeeded
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
      }

      await api.post("/api/posts", body);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Type selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setType("discussion")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
            type === "discussion"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-gray-800/50 border border-white/10 text-gray-400"
          }`}
        >
          <MessageSquare size={14} /> Discussion
        </button>
        <button
          onClick={() => setType("recruitment")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
            type === "recruitment"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-gray-800/50 border border-white/10 text-gray-400"
          }`}
        >
          <Users size={14} /> Recruitment
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 text-sm"
      />

      {/* Content */}
      <textarea
        placeholder="Write your post content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        maxLength={10000}
        className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 text-sm resize-y"
      />

      {/* Recruitment fields */}
      {type === "recruitment" && (
        <div className="space-y-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
          <input
            type="text"
            placeholder="Hackathon name (optional)"
            value={hackathonName}
            onChange={(e) => setHackathonName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Team Size</label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                min={1}
                max={20}
                className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex-[2]">
              <label className="text-xs text-gray-400 mb-1 block">Roles Needed (comma-separated)</label>
              <input
                type="text"
                placeholder="Frontend, ML Engineer, Designer"
                value={rolesNeeded}
                onChange={(e) => setRolesNeeded(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      <input
        type="text"
        placeholder="Tags (comma-separated): react, hackathon, ml"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 text-sm"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
