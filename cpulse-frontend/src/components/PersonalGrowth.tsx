import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

/* ===================== TYPES ===================== */

interface Growth {
  date: string;
  score: number;
}

interface UserStats {
  platform: "codeforces" | "leetcode";
  handle: string;

  // Codeforces
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;

  // LeetCode
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;

  history: Growth[];
}

/* ===================== COMPONENT ===================== */

export default function PersonalGrowth() {
  const { username, platform } = useParams<{
    username: string;
    platform: "codeforces" | "leetcode";
  }>();

  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username || !platform) {
      setError("Missing username or platform");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    axios
      .get(`http://localhost:5000/user/${platform}/${username}/history`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch user data. User may not exist.");
        setLoading(false);
      });
  }, [username, platform]);

  /* ===================== LOADING ===================== */

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  /* ===================== ERROR ===================== */

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-6 rounded-xl text-center">
        <h2 className="text-lg font-semibold mb-2">
          Something went wrong
        </h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  /* ===================== UI ===================== */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ===================== HEADER ===================== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold">{data.handle}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          Platform: {data.platform}
        </p>
      </div>

      {/* ===================== STATS ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.platform === "codeforces" && (
          <>
            <Stat label="Rating" value={data.rating} />
            <Stat label="Max Rating" value={data.maxRating} />
            <Stat label="Rank" value={data.rank} />
            <Stat label="Max Rank" value={data.maxRank} />
          </>
        )}

        {data.platform === "leetcode" && (
          <>
            <Stat label="Total Solved" value={data.totalSolved} />
            <Stat label="Easy" value={data.easySolved} />
            <Stat label="Medium" value={data.mediumSolved} />
            <Stat label="Hard" value={data.hardSolved} />
          </>
        )}
      </div>

      {/* ===================== GROWTH CHART ===================== */}
      {data.history?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Rating / Score Progress
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ===================== NO HISTORY ===================== */}
      {data.history?.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            No growth data yet. Stats shown above are current.
          </p>
        </div>
      )}
    </div>
  );
}

/* ===================== STAT CARD ===================== */

function Stat({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">
        {value ?? "N/A"}
      </p>
    </div>
  );
}
