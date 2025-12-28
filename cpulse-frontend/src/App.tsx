import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Leaderboard from "./components/Leaderboard";
import PersonalGrowth from "./components/PersonalGrowth";
import UserSearch from "./components/UserSearch";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);

    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            CPulse Tracker
          </Link>

          <Link
            to="/"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Search
          </Link>

          <Link
            to="/leaderboard"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Leaderboard
          </Link>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          {/* Home = Search users */}
          <Route path="/" element={<UserSearch />} />

          {/* Leaderboard */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Personal growth (dynamic users) */}
          <Route
            path="/growth/:username/:platform"
            element={<PersonalGrowth />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                <p className="text-lg">Page not found</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
