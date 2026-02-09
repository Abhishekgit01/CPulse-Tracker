import { useState } from "react";
import api from "../api/axios";
import { UserProfileData } from "../types";
import { X, Save, Palette, Frame, Sparkles } from "lucide-react";

interface ProfileCustomizerProps {
  profile: UserProfileData;
  onClose: () => void;
  onSaved: (updated: UserProfileData) => void;
}

const ALL_THEMES = [
  { id: "default", name: "Default", color: "#374151" },
  { id: "midnight", name: "Midnight", color: "#0a0e1a" },
  { id: "ocean", name: "Ocean", color: "#0c1929" },
  { id: "hacker", name: "Hacker", color: "#0a1a0a" },
  { id: "neon", name: "Neon", color: "#1a0a2e" },
  { id: "cyberpunk", name: "Cyberpunk", color: "#1a0a0a" },
];

const ALL_BORDERS = [
  { id: "none", name: "None" },
  { id: "gradient", name: "Gradient" },
  { id: "animated", name: "Animated" },
];

const ALL_FRAMES = [
  { id: "none", name: "None", color: "" },
  { id: "bronze", name: "Bronze", color: "#b45309" },
  { id: "silver", name: "Silver", color: "#9ca3af" },
  { id: "gold", name: "Gold", color: "#eab308" },
  { id: "diamond", name: "Diamond", color: "#67e8f9" },
];

export default function ProfileCustomizer({ profile, onClose, onSaved }: ProfileCustomizerProps) {
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [github, setGithub] = useState(profile.socialLinks?.github || "");
  const [linkedin, setLinkedin] = useState(profile.socialLinks?.linkedin || "");
  const [twitter, setTwitter] = useState(profile.socialLinks?.twitter || "");
  const [portfolio, setPortfolio] = useState(profile.socialLinks?.portfolio || "");
  const [theme, setTheme] = useState(profile.theme);
  const [borderStyle, setBorderStyle] = useState(profile.borderStyle);
  const [avatarFrame, setAvatarFrame] = useState(profile.avatarFrame);
  const [bannerColor, setBannerColor] = useState(profile.bannerColor);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"info" | "style">("info");

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save profile info
      const infoRes = await api.patch("/api/profiles/me/update", {
        bio,
        location,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        socialLinks: { github, linkedin, twitter, portfolio },
      });

      // Save customization
      await api.post("/api/profiles/me/customize", {
        theme,
        borderStyle,
        avatarFrame,
        bannerColor,
      });

      if (infoRes.data.success) {
        onSaved({
          ...infoRes.data.profile,
          theme,
          borderStyle,
          avatarFrame,
          bannerColor,
        });
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Customize Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Section toggle */}
        <div className="flex gap-2 p-4 border-b border-white/5">
          <button
            onClick={() => setActiveSection("info")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === "info" ? "bg-indigo-600 text-white" : "bg-gray-800/50 text-gray-400"
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveSection("style")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === "style" ? "bg-indigo-600 text-white" : "bg-gray-800/50 text-gray-400"
            }`}
          >
            <Sparkles size={14} /> Style
          </button>
        </div>

        <div className="p-5 space-y-4">
          {activeSection === "info" && (
            <>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Skills (comma-separated)</label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Python, React, ML"
                  className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">GitHub URL</label>
                  <input value={github} onChange={(e) => setGithub(e.target.value)} className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">LinkedIn URL</label>
                  <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Twitter URL</label>
                  <input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Portfolio URL</label>
                  <input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                </div>
              </div>
            </>
          )}

          {activeSection === "style" && (
            <>
              {/* Themes */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1">
                  <Palette size={12} /> Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_THEMES.map((t) => {
                    const unlocked = profile.unlockedThemes.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => unlocked && setTheme(t.id)}
                        disabled={!unlocked}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                          theme === t.id
                            ? "border-indigo-500 bg-indigo-500/20 text-white"
                            : unlocked
                            ? "border-white/10 text-gray-300 hover:border-white/20"
                            : "border-white/5 text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <div className="w-full h-4 rounded mb-1" style={{ background: t.color }} />
                        {t.name} {!unlocked && "🔒"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Frames */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1">
                  <Frame size={12} /> Avatar Frame
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_FRAMES.map((f) => {
                    const unlocked = profile.unlockedFrames.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => unlocked && setAvatarFrame(f.id)}
                        disabled={!unlocked}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          avatarFrame === f.id
                            ? "border-indigo-500 bg-indigo-500/20 text-white"
                            : unlocked
                            ? "border-white/10 text-gray-300 hover:border-white/20"
                            : "border-white/5 text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                        style={f.color ? { borderLeftColor: f.color, borderLeftWidth: 3 } : {}}
                      >
                        {f.name} {!unlocked && "🔒"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Borders */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Border Style</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_BORDERS.map((b) => {
                    const unlocked = profile.unlockedBorders.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        onClick={() => unlocked && setBorderStyle(b.id)}
                        disabled={!unlocked}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          borderStyle === b.id
                            ? "border-indigo-500 bg-indigo-500/20 text-white"
                            : unlocked
                            ? "border-white/10 text-gray-300 hover:border-white/20"
                            : "border-white/5 text-gray-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {b.name} {!unlocked && "🔒"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Banner Color */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Banner Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <div
                    className="flex-1 h-10 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${bannerColor}, ${bannerColor}88, #1e1b4b)` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
