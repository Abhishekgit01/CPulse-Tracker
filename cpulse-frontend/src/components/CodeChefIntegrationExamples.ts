import api from "../api/axios";

/**
 * Example of how to use CodeChef integration in other components
 */

// ===================== EXAMPLE 1: Fetch CodeChef Stats =====================
async function fetchCodeChefUser(username: string) {
  try {
    const response = await api.get(`/api/user/codechef/${username}`);
    console.log("CodeChef Stats:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error:", error.response?.data?.error || error.message);
    throw error;
  }
}

// ===================== EXAMPLE 2: Using in a React Component =====================
/*
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

interface CodeChefStats {
  handle: string;
  platform: "codechef";
  rating: number;
  maxRating: number;
  stars: number;
  globalRank: number;
  countryRank: number;
  problemsSolved: number;
  history: Array<{ date: string; score: number }>;
}

export function MyComponent() {
  const { username } = useParams<{ username: string }>();
  const [stats, setStats] = useState<CodeChefStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/user/codechef/${username}`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div>
      <h1>{stats.handle} - Rating: {stats.rating}</h1>
      <p>Stars: {"⭐".repeat(stats.stars)}</p>
      <p>Problems Solved: {stats.problemsSolved}</p>
    </div>
  );
}
*/

// ===================== EXAMPLE 3: Display in Leaderboard =====================
/*
// Add this column to existing leaderboards
interface LeaderboardUser {
  handle: string;
  platform: "codeforces" | "leetcode" | "codechef";
  cpulseRating: number;
  rating?: number;      // Platform-specific rating
  stars?: number;       // CodeChef stars
}

// In your leaderboard rendering:
{user.platform === "codechef" && (
  <div className="flex items-center gap-2">
    {"⭐".repeat(user.stars || 0)}
    <span className="text-orange-400">Rating: {user.rating}</span>
  </div>
)}
*/

// ===================== EXAMPLE 4: Compare Multiple Platforms =====================
/*
async function compareUserAcrossAllPlatforms(handle: string) {
  try {
    const platforms = ["codeforces", "leetcode", "codechef"];
    const results: any = {};

    for (const platform of platforms) {
      try {
        if (platform === "codechef") {
          results[platform] = await axios.get(
              `/api/user/codechef/${handle}`
            );
          } else {
            results[platform] = await axios.get(
              `/api/user/${platform}/${handle}/history`
          );
        }
      } catch (err) {
        results[platform] = null; // User doesn't exist on this platform
      }
    }

    return results;
  } catch (error) {
    console.error("Comparison failed:", error);
  }
}
*/

export { fetchCodeChefUser };
