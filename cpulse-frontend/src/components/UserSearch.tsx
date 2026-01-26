import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PLATFORMS = [
  {
    id: "codeforces",
    name: "Codeforces",
    icon: "⚡",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-300",
    description: "Real-time contests",
  },
  {
    id: "codechef",
    name: "CodeChef",
    icon: "🍽️",
    color: "from-amber-600 to-amber-700",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-300",
    description: "Monthly contests",
  },
  {
    id: "leetcode",
    name: "LeetCode",
    icon: "💻",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    textColor: "text-yellow-700 dark:text-yellow-300",
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
      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 500));

      // CodeChef has a different route structure
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

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            🔍 Find Competitive Programmer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Search across Codeforces, CodeChef, and LeetCode
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
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
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition text-lg"
                />
                {username && (
                  <button
                    type="button"
                    onClick={() => setUsername("")}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                Select Platform
              </label>
              <div className="grid grid-cols-3 gap-4">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPlatform(p.id as "codeforces" | "codechef" | "leetcode");
                      setError("");
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      platform === p.id
                        ? `${p.bgColor} border-blue-500 shadow-lg scale-105`
                        : `bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
                    }`}
                  >
                    {/* Selected Checkmark */}
                    {platform === p.id && (
                      <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}

                    {/* Icon & Name */}
                    <div className="text-center">
                      <div className="text-3xl mb-2">{p.icon}</div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {p.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            {selectedPlatform && (
              <div
                className={`p-4 rounded-lg ${selectedPlatform.bgColor} border-l-4 ${
                  selectedPlatform.id === "codeforces"
                    ? "border-red-500"
                    : selectedPlatform.id === "codechef"
                      ? "border-amber-600"
                      : "border-yellow-500"
                }`}
              >
                <p className={`text-sm ${selectedPlatform.textColor}`}>
                  {selectedPlatform.id === "codeforces" &&
                    "🔗 Find users from competitive programming contests"}
                  {selectedPlatform.id === "codechef" &&
                    "🔗 Search CodeChef rated users and statistics"}
                  {selectedPlatform.id === "leetcode" &&
                    "🔗 Find LeetCode users and their problem stats"}
                </p>
              </div>
            )}

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                loading || !username.trim()
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : `bg-gradient-to-r ${selectedPlatform?.color} hover:shadow-lg hover:-translate-y-1 active:translate-y-0`
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Searching...
                </>
              ) : (
                <>
                  🔍 Search & Track
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

          {/* Quick Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              💡 Tips:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>✓ Search usernames from any competitive programming platform</li>
              <li>✓ View ratings, problems solved, and growth history</li>
              <li>✓ Compare users on the comparison page</li>
              <li>✓ Usernames are case-sensitive on most platforms</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Join the{" "}
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CPulse
            </span>{" "}
            community and track your competitive programming journey! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
