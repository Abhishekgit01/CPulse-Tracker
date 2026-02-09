import { useState } from "react";
import api from "../api/axios";

interface UserProfile {
  handle: string;
  platform: "codeforces" | "leetcode" | "codechef";
  rating?: number;
  cpulseRating?: number;
  problemsSolved?: number;
  maxRating?: number;
}

interface ComparisonData {
  user1: UserProfile | null;
  user2: UserProfile | null;
}

export default function ComparisonView() {
  const [user1Input, setUser1Input] = useState("");
  const [user2Input, setUser2Input] = useState("");
  const [comparison, setComparison] = useState<ComparisonData>({
    user1: null,
    user2: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserProfile = async (handle: string, index: 1 | 2) => {
    try {
      setLoading(true);
      setError("");

      // Try different platforms
      const platforms = ["codeforces", "codechef", "leetcode"] as const;
      let foundData: UserProfile | null = null;

      for (const platform of platforms) {
        try {
          const res = await api.get(`/api/user/${platform}/${handle}`);
          foundData = { ...res.data, platform } as UserProfile;
          break;
        } catch {
          continue;
        }
      }

      if (!foundData) {
        throw new Error(`User ${handle} not found on any platform`);
      }

      if (index === 1) {
        setComparison((prev) => ({ ...prev, user1: foundData }));
        setUser1Input("");
      } else {
        setComparison((prev) => ({ ...prev, user2: foundData }));
        setUser2Input("");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (index: 1 | 2) => {
    const input = index === 1 ? user1Input : user2Input;
    if (!input.trim()) {
      setError("Please enter a username");
      return;
    }
    await fetchUserProfile(input, index);
  };

  const getWinner = (
    value1: number | undefined,
    value2: number | undefined
  ) => {
    if (!value1 || !value2) return null;
    if (value1 > value2) return 1;
    if (value2 > value1) return 2;
    return null;
  };

  const ComparisonBar: React.FC<{
    label: string;
    value1?: number;
    value2?: number;
  }> = ({ label, value1 = 0, value2 = 0 }) => {
    const max = Math.max(value1, value2, 1);
    const winner = getWinner(value1, value2);

    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <div className="flex gap-4">
            <span
              className={`font-bold ${
                winner === 1 ? "text-green-600" : "text-gray-500"
              }`}
            >
              {value1.toLocaleString()}
            </span>
            <span
              className={`font-bold ${
                winner === 2 ? "text-green-600" : "text-gray-500"
              }`}
            >
              {value2.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <div
            className={`bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-center text-white text-xs font-bold ${
              winner === 1 ? "ring-2 ring-green-400" : ""
            }`}
            style={{ width: `${(value1 / max) * 100}%` }}
          >
            {value1 > max * 0.15 && value1.toLocaleString()}
          </div>
          <div
            className={`bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 flex items-center justify-center text-white text-xs font-bold ${
              winner === 2 ? "ring-2 ring-green-400" : ""
            }`}
            style={{ width: `${(value2 / max) * 100}%` }}
          >
            {value2 > max * 0.15 && value2.toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          ⚔️ Competitive Showdown
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare your competitive programming skills with another user
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User 1 */}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
            👤 Player 1
          </h2>
          {!comparison.user1 ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username..."
                value={user1Input}
                onChange={(e) => setUser1Input(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCompare(1)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleCompare(1)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {comparison.user1.handle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {comparison.user1.platform}
                </p>
              </div>
              <button
                onClick={() =>
                  setComparison((prev) => ({ ...prev, user1: null }))
                }
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Change User
              </button>
            </div>
          )}
        </div>

        {/* User 2 */}
        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4">
            👤 Player 2
          </h2>
          {!comparison.user2 ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username..."
                value={user2Input}
                onChange={(e) => setUser2Input(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCompare(2)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleCompare(2)}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {comparison.user2.handle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {comparison.user2.platform}
                </p>
              </div>
              <button
                onClick={() =>
                  setComparison((prev) => ({ ...prev, user2: null }))
                }
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Change User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Comparison Results */}
      {comparison.user1 && comparison.user2 && (
        <div className="space-y-8">
          {/* Overall Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📊 Head-to-Head Comparison
            </h2>

            {comparison.user1.rating &&
              comparison.user2.rating && (
              <ComparisonBar
                label="Current Rating"
                value1={comparison.user1.rating}
                value2={comparison.user2.rating}
              />
            )}

            {comparison.user1.maxRating &&
              comparison.user2.maxRating && (
              <ComparisonBar
                label="Max Rating"
                value1={comparison.user1.maxRating}
                value2={comparison.user2.maxRating}
              />
            )}

            {comparison.user1.problemsSolved &&
              comparison.user2.problemsSolved && (
              <ComparisonBar
                label="Problems Solved"
                value1={comparison.user1.problemsSolved}
                value2={comparison.user2.problemsSolved}
              />
            )}

            {comparison.user1.cpulseRating &&
              comparison.user2.cpulseRating && (
              <ComparisonBar
                label="CPulse Rating"
                value1={comparison.user1.cpulseRating}
                value2={comparison.user2.cpulseRating}
              />
            )}
          </div>

          {/* Winner Banner */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-full shadow-lg">
              ⚡ Overall Winner:{" "}
              {(comparison.user1.rating || 0) > (comparison.user2.rating || 0)
                ? comparison.user1.handle
                : comparison.user2.handle}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!comparison.user1 && !comparison.user2 && (
        <div className="text-center py-16">
          <p className="text-3xl mb-4">🤝</p>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Search for two users to begin comparing their profiles
          </p>
        </div>
      )}
    </div>
  );
}
