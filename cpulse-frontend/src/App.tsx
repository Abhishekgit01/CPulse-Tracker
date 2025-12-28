import React from "react";
import Leaderboard from "./components/Leaderboard";

function App() {
  return (
    <div className="max-w-5xl mx-auto">
      <Leaderboard />
      {/* Later you can add <PersonalGrowth username="tourist" platform="codeforces" /> */}
    </div>
  );
}

export default App;
