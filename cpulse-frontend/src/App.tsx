import { Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CollegeDashboard from "./components/CollegeDashboard";
import Leaderboard from "./components/Leaderboard";
import PersonalGrowth from "./components/PersonalGrowth";
import CodeChefStats from "./components/CodeChefStats";
import UserSearch from "./components/UserSearch";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import AICoach from "./components/AICoach";
import Compare from "./components/Compare";
import { useAuth } from "./context/AuthContext";
// Enhanced UI Components
import EnhancedLeaderboard from "./components/EnhancedLeaderboard";
import EnhancedCodeChefStats from "./components/EnhancedCodeChefStats";
import ComparisonView from "./components/ComparisonView";
import OnboardingWizard from "./components/OnboardingWizard";
import StatsDashboard from "./components/StatsDashboard";
import ProblemOfTheDay from "./components/ProblemOfTheDay";
import Companies from "./components/Companies";
import CompanyDetails from "./components/CompanyDetails";
import ContestCalendar from "./components/ContestCalendar";
import ClassLeaderboard from "./components/ClassLeaderboard";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [enhancedUI, setEnhancedUI] = useState(true);
  const { token, logout } = useAuth();

  /* ================= LOAD THEME ================= */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedUI = localStorage.getItem("enhancedUI");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    if (savedUI === "true") {
      setEnhancedUI(true);
    }
  }, []);

  /* ================= TOGGLE THEME ================= */
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

  /* ================= TOGGLE ENHANCED UI ================= */
  const toggleEnhancedUI = () => {
    const next = !enhancedUI;
    setEnhancedUI(next);
    localStorage.setItem("enhancedUI", String(next));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            CPulse Tracker
          </Link>

          <Link
            to="/search"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Search
          </Link>

          <Link
            to="/college"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            College Dashboard
          </Link>

          <Link
            to="/leaderboard"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Global Rank
          </Link>

          <Link
            to="/compare"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Compare
          </Link>

          <Link
            to="/contests"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Contests
          </Link>

          <Link
            to="/companies"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Companies


          </Link>

          <Link
            to="/problem-of-day"
            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            📝 Daily
          </Link>

          {enhancedUI && (
            <Link
              to="/dashboard"
              className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              📊 Stats
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* UI Version Toggle */}
          <button
            onClick={toggleEnhancedUI}
            title={enhancedUI ? "Switch to Classic UI" : "Try Enhanced UI"}
            className={`px-3 py-2 rounded-lg transition ${enhancedUI
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
          >
            {enhancedUI ? "✨ Enhanced" : "Classic"}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Auth buttons */}
          {!token ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav >

      {/* ================= MAIN CONTENT ================= */}
      < main className={`${enhancedUI ? "" : "max-w-6xl"} mx-auto p-6`
      }>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Search */}
          <Route path="/search" element={<UserSearch />} />

          {/* Leaderboards - Classic vs Enhanced */}
          <Route
            path="/leaderboard"
            element={enhancedUI ? <EnhancedLeaderboard /> : <Leaderboard />}
          />
          <Route path="/college" element={<CollegeDashboard />} />

          {/* Personal Growth */}
          <Route
            path="/growth/:platform/:username"
            element={<PersonalGrowth />}
          />

          {/* CodeChef Stats - Classic vs Enhanced */}
          <Route
            path="/codechef/:username"
            element={enhancedUI ? <EnhancedCodeChefStats /> : <CodeChefStats />}
          />

          {/* Enhanced Features */}
          <Route path="/compare" element={<Compare />} />
          <Route path="/problem-of-day" element={<ProblemOfTheDay />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:slug" element={<CompanyDetails />} />
          <Route path="/contests" element={<ContestCalendar />} />

          {enhancedUI && (
            <>
              <Route path="/onboarding" element={<OnboardingWizard />} />
              <Route path="/dashboard" element={<StatsDashboard />} />
            </>
          )}

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
      </main >

      {/* CP Tutor (Floating) */}
      < AICoach />
    </div >
  );
}
