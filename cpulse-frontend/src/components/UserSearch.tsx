import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PLATFORMS = [
  {
    id: "codeforces",
    name: "Codeforces",
    icon: "\u26A1",
    accent: "indigo",
    description: "Real-time contests",
  },
  {
    id: "codechef",
    name: "CodeChef",
    icon: "\uD83C\uDF7D\uFE0F",
    accent: "amber",
    description: "Monthly contests",
  },
  {
    id: "leetcode",
    name: "LeetCode",
    icon: "\uD83D\uDCBB",
    accent: "purple",
    description: "Interview prep",
  },
];

export default function UserSearch() {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState<"codeforces" | "codechef" | "leetcode">("codeforces");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (platform === "codechef") {
        navigate(`/codechef/${username}`);
      } else {
        navigate(`/growth/${platform}/${username}`);
      }
    } catch (err) {
      setError("Failed to search user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Find Competitive Programmer
          </h1>
          <p className="text-gray-400 text-lg">
            Search across Codeforces, CodeChef, and LeetCode
          </p>
        </div>

          {/* Card */}
          <div className="glass-card rounded-3xl p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. tourist, __ash__, john_smith"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none text-lg"
                />
                {username && (
                  <button
                    type="button"
                    onClick={() => setUsername("")}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 text-xl transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">
                  {error}
                </p>
              )}
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4">
                Select Platform
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPlatform(p.id as "codeforces" | "codechef" | "leetcode");
                      setError("");
                    }}
                    className={`glass-button p-4 rounded-xl transition-all duration-300 ${
                      platform === p.id
                        ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{p.icon}</div>
                      <h3 className="font-bold text-white mb-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {p.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className={`w-full py-3 rounded-xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                loading || !username.trim()
                  ? "bg-gray-700/50 cursor-not-allowed text-gray-500"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400/20 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Searching...
                </>
              ) : (
                "Search & Track"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 border-t border-white/5" />

          {/* Quick Tips */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-indigo-300 mb-2">
              Tips
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>- Search usernames from any competitive programming platform</li>
              <li>- View ratings, problems solved, and growth history</li>
              <li>- Compare users on the comparison page</li>
              <li>- Usernames are case-sensitive on most platforms</li>
            </ul>
            </div>
          </div>
        </div>
      </div>
  );
}
