import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  handle: string;
  rating: number;
  rank: string;
}

export default function ClassLeaderboard() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchClass, setSearchClass] = useState("");


  // Fetch all classes on load
  useEffect(() => {
    axios.get("http://localhost:5000/classes").then((res) => {
      setClasses(res.data);
    });
  }, []);

  // Fetch leaderboard for selected class
  const fetchLeaderboard = (classId: string) => {
    setSelectedClass(classId);
    setLoading(true);

    axios
      .get(`http://localhost:5000/leaderboard/class/${classId}`)
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
            className={`p-4 rounded-xl border transition ${
              selectedClass === cls
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
                key={u.handle}
                className="flex justify-between px-4 py-3 border-b dark:border-gray-700"
              >
                <span>
                  #{i + 1} {u.handle}
                </span>
                <span>{u.rating}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
