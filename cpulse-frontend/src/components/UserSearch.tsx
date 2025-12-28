import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserSearch() {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState("codeforces");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    navigate(`/growth/${username}/${platform}`);
  };

  return (
    <div className="max-w-md mx-auto mt-24 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-center">
        Track Competitive Programmer
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username (e.g. tourist)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="codeforces">Codeforces</option>
          <option value="leetcode">LeetCode</option>
          <option value="atcoder">AtCoder</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Search & Track
        </button>
      </form>
    </div>
  );
}
