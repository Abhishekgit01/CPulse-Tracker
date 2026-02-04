import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axios";

interface User {
  handle: string;
  cpulseRating: number;
  platform: "codeforces" | "leetcode" | "codechef";
}

export default function ClassLeaderboard() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchClass, setSearchClass] = useState("");


  // Fetch all classes on load
  useEffect(() => {
    axios.get("/classes").then((res) => {
      setClasses(res.data);
    });
  }, []);

  // Fetch leaderboard for selected class
  const fetchLeaderboard = (classId: string) => {
    setSelectedClass(classId);
    setLoading(true);

    api.get(`/leaderboard/class/${classId}`)
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold">Class Leaderboards</h2>

      {/* SEARCH CLASS */}
      <div className="flex gap-3 max-w-md">
        <input
          value={searchClass}
          onChange={(e) => setSearchClass(e.target.value)}
          placeholder="Search class (e.g. CS-A)"
          className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          onClick={() => {
            if (!searchClass) return;
            fetchLeaderboard(searchClass);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Search
        </button>
      </div>


      {/* CLASS LIST */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => fetchLeaderboard(cls)}
            className={`p-4 rounded-xl border transition ${selectedClass === cls
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700"
              }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* LEADERBOARD */}
      {selectedClass && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="text-lg font-semibold p-4 border-b dark:border-gray-700">
            {selectedClass} Leaderboard
          </h3>

          {loading ? (
            <p className="p-4">Loading...</p>
          ) : (
            users.map((u, i) => (
              <div
                key={`${u.handle}-${u.platform}`}
                className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold w-6">#{i + 1}</span>
                  <span className="font-medium">{u.handle}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                    ${u.platform === "codeforces" ? "bg-red-100 text-red-600" :
                      u.platform === "codechef" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"}`}>
                    {u.platform}
                  </span>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {u.cpulseRating}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
