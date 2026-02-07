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
// Sparkles
import { SparklesCore } from "./components/ui/sparkles";
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

    return (
    <div className="min-h-screen relative bg-[#0B1120] text-gray-100 transition-colors">
      {/* ================= SPARKLES BACKGROUND ================= */}
      <div className="fixed inset-0 w-full h-full z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/60 via-transparent to-[#0B1120]/80 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />
      </div>

    {/* ================= NAVBAR (Floating Pill Buttons) ================= */}
        <nav className="sticky top-0 z-50 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* LEFT - Logo + Nav pills */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 font-bold text-sm hidden sm:inline">
                  CPulse
                </span>
              </Link>

              {/* Desktop nav link pills */}
              <div className="hidden lg:flex items-center gap-1 ml-1">
                {[
                  { to: "/search", label: "Search", icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></> },
                  { to: "/college", label: "College", icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></> },
                  { to: "/leaderboard", label: "Leaderboard", icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
                  { to: "/compare", label: "Compare", icon: <><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></> },
                  { to: "/problem-of-day", label: "Daily", icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
                ].map(({ to, label, icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-sm shadow-indigo-500/10"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "opacity-100" : "opacity-50"}>
                        {icon}
                      </svg>
                      {label}
                    </Link>
                  );
                })}
                {token && (
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      location.pathname === "/dashboard"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-sm shadow-indigo-500/10"
                        : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/15"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* RIGHT - Action buttons */}
            <div className="flex items-center gap-1.5">
              {/* Enhanced/Classic toggle pill */}
              <button
                onClick={toggleEnhancedUI}
                title={enhancedUI ? "Switch to Classic UI" : "Try Enhanced UI"}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                  enhancedUI
                    ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-sm shadow-purple-500/10"
                    : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1]"
                }`}
              >
                <span className={enhancedUI
                  ? "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-gray-500"
                }>
                  {enhancedUI ? "Enhanced" : "Classic"}
                </span>
              </button>

              {/* Theme toggle button */}
              <button
                onClick={toggleDarkMode}
                title="Toggle theme"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.12] flex items-center justify-center transition-all hover:scale-110 active:scale-90"
              >
                <span className="text-sm transition-transform duration-300" style={{ display: 'inline-block', transform: darkMode ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                  {darkMode ? "☀️" : "🌙"}
                </span>
              </button>

              {!token ? (
                <>
                  {/* Login button - gradient border accent */}
                  <Link
                    to="/login"
                    className="group flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/25 hover:border-indigo-400/40 hover:from-indigo-500/15 hover:to-purple-500/15 hover:shadow-md hover:shadow-indigo-500/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="url(#login-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 transition-opacity">
                      <defs><linearGradient id="login-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Login
                    </span>
                  </Link>

                  {/* Register button - outlined style */}
                  <Link
                    to="/register"
                    className="group hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {/* User profile chip */}
                  {user && (
                    <Link
                      to="/dashboard"
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-indigo-500/30">
                        {(user.displayName || user.email)[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-300 max-w-[100px] truncate">
                        {user.displayName || user.email.split("@")[0]}
                      </span>
                    </Link>
                  )}

                  {/* Logout button */}
                  <button
                    onClick={logout}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-300 bg-red-500/[0.06] border border-red-500/10 hover:bg-red-500/[0.12] hover:border-red-500/20 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 transition-opacity">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.12] flex items-center justify-center transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
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
            <div className="lg:hidden mt-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
              {[
                { to: "/search", label: "Search" },
                { to: "/college", label: "College" },
                { to: "/leaderboard", label: "Leaderboard" },
                { to: "/compare", label: "Compare" },
                { to: "/problem-of-day", label: "Daily" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === to
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  {label}
                </Link>
              ))}
              {token && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === "/dashboard"
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                      : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          )}
        </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className={`${enhancedUI ? "" : "max-w-6xl"} mx-auto p-6 relative z-10`}>
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
