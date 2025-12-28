import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../types";

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/leaderboard/combined")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CPulse Leaderboard</h1>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border px-2 py-1">Rank</th>
            <th className="border px-2 py-1">Handle</th>
            <th className="border px-2 py-1">Platform</th>
            <th className="border px-2 py-1">Score</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.handle}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{u.handle}</td>
              <td className="border px-2 py-1">{u.platform}</td>
              <td className="border px-2 py-1">
                {u.platform === "codeforces" ? u.rating : u.totalSolved}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
