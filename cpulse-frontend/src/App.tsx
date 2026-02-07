import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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
import Onboarding from "./components/Onboarding";
import UserDashboard from "./components/UserDashboard";
import { useAuth } from "./context/AuthContext";
// Enhanced UI Components
import EnhancedLeaderboard from "./components/EnhancedLeaderboard";
import EnhancedCodeChefStats from "./components/EnhancedCodeChefStats";
import ComparisonView from "./components/ComparisonView";
import OnboardingWizard from "./components/OnboardingWizard";
import StatsDashboard from "./components/StatsDashboard";
import ProblemOfTheDay from "./components/ProblemOfTheDay";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [enhancedUI, setEnhancedUI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { token, user, loading, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  /* ================= LOADING SPLASH ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">CPulse Tracker</h2>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? "text-indigo-400"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors">
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-lg font-bold"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 hidden sm:inline">
                CPulse
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/search" className={navLinkClass("/search")}>Search</Link>
              <Link to="/college" className={navLinkClass("/college")}>College</Link>
              <Link to="/leaderboard" className={navLinkClass("/leaderboard")}>Leaderboard</Link>
              <Link to="/compare" className={navLinkClass("/compare")}>Compare</Link>
              <Link to="/problem-of-day" className={navLinkClass("/problem-of-day")}>Daily</Link>
              {token && (
                <Link to="/dashboard" className={`text-sm font-semibold transition-colors ${
                  location.pathname === "/dashboard"
                    ? "text-indigo-400"
                    : "text-indigo-400/70 hover:text-indigo-400"
                }`}>
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleEnhancedUI}
              title={enhancedUI ? "Switch to Classic UI" : "Try Enhanced UI"}
              className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-medium transition ${enhancedUI
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10"
                }`}
            >
              {enhancedUI ? "Enhanced" : "Classic"}
            </button>

            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-300 dark:hover:bg-white/10 transition flex items-center justify-center text-sm"
            >
              {darkMode ? "\u2600" : "\u263E"}
            </button>

            {!token ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {user && (
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {(user.displayName || user.email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 max-w-[120px] truncate">
                      {user.displayName || user.email.split("@")[0]}
                    </span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                {mobileMenuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                ) : (
                  <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
            <Link to="/search" className={`${navLinkClass("/search")} py-2`}>Search</Link>
            <Link to="/college" className={`${navLinkClass("/college")} py-2`}>College</Link>
            <Link to="/leaderboard" className={`${navLinkClass("/leaderboard")} py-2`}>Leaderboard</Link>
            <Link to="/compare" className={`${navLinkClass("/compare")} py-2`}>Compare</Link>
            <Link to="/problem-of-day" className={`${navLinkClass("/problem-of-day")} py-2`}>Daily</Link>
            {token && <Link to="/dashboard" className={`${navLinkClass("/dashboard")} py-2`}>Dashboard</Link>}
          </div>
        )}
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className={`${enhancedUI ? "" : "max-w-6xl"} mx-auto p-6`}>
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

          {/* Auth */}
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/onboarding" element={token ? <Onboarding /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={token ? <UserDashboard /> : <Navigate to="/login" />} />

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

      {/* CP Tutor (Floating) */}
      <AICoach />
    </div>
  );
}
