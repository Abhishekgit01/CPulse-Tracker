import { useState, useEffect } from "react";
import api from "../api/axios";

interface CodeChefUserCard {
  handle: string;
  rating: number;
  maxRating: number;
  stars: number;
  problemsSolved: number;
}

interface Props {
  username: string;
  showLink?: boolean;
  compact?: boolean;
}

/**
 * CodeChefUserCard Component
 * Displays a compact card with CodeChef user information
 * Can be embedded in leaderboards or user comparison views
 */
export default function CodeChefUserCard({ username, showLink = true, compact = false }: Props) {
  const [user, setUser] = useState<CodeChefUserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/user/codechef/${username}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load");
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return <div className="bg-gray-700 rounded p-3 h-20 animate-pulse" />;
  }

  if (error || !user) {
    return (
      <div className="bg-gray-700 rounded p-3 text-gray-400 text-sm">
        CodeChef: {error}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-3 text-white text-sm">
        <div className="font-semibold flex items-center justify-between">
          <span>🍳 CodeChef</span>
          <span className="text-lg">{user.rating}</span>
        </div>
        <div className="text-xs text-orange-100 mt-1">
          {user.stars} ⭐ • {user.problemsSolved} solved
        </div>
        {showLink && (
          <a
            href={`https://www.codechef.com/users/${user.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-200 hover:text-white text-xs mt-2 inline-block underline"
          >
            View Profile →
          </a>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">🍳 {user.handle}</h3>
        <span className="text-2xl font-bold">{user.rating}</span>
      </div>

      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-orange-100">Max Rating:</span>
          <span className="font-semibold">{user.maxRating}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-orange-100">Stars:</span>
          <span>{"⭐".repeat(user.stars)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-orange-100">Problems:</span>
          <span className="font-semibold">{user.problemsSolved}</span>
        </div>
      </div>

      {showLink && (
        <a
          href={`https://www.codechef.com/users/${user.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-orange-800 hover:bg-orange-900 py-2 rounded text-sm font-semibold transition"
        >
          View Profile
        </a>
      )}
    </div>
  );
}

// Example usage in a leaderboard row:
/*
<div className="grid grid-cols-3 gap-4">
  <CodeChefUserCard username="tourist" compact={true} />
  <CodeChefUserCard username="umnik" compact={true} />
  <CodeChefUserCard username="rng_58" compact={true} />
</div>
*/
