import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";

interface Growth {
  date: string;
  score: number;
}

export default function PersonalGrowth({ username, platform }: { username: string, platform: string }) {
  const [data, setData] = useState<Growth[]>([]);

  useEffect(() => {
    // Fetch your historical growth data from your backend
    axios.get(`http://localhost:5000/user/${platform}/${username}/history`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [username, platform]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Personal Growth - {username}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
