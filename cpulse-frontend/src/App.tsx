import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import CollegeDashboard from "./components/CollegeDashboard";
import PersonalGrowth from "./components/PersonalGrowth";
import UserSearch from "./components/UserSearch";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import AICoach from "./components/AICoach";
import Compare from "./components/Compare";
import Onboarding from "./components/Onboarding";
import UserDashboard from "./components/UserDashboard";
import ManagerPanel from "./components/ManagerPanel";
import AdminPanel from "./components/AdminPanel";
import { useAuth } from "./context/AuthContext";
import EnhancedLeaderboard from "./components/EnhancedLeaderboard";
import EnhancedCodeChefStats from "./components/EnhancedCodeChefStats";
import ProblemOfTheDay from "./components/ProblemOfTheDay";
import ContestCalendar from "./components/ContestCalendar";
import Companies from "./components/Companies";
import CompanyDetails from "./components/CompanyDetails";
import { SparklesCore } from "./components/ui/sparkles";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/college", label: "College" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/compare", label: "Compare" },
  { to: "/problem-of-day", label: "Daily" },
  { to: "/contests", label: "Contests" },
  { to: "/companies", label: "Companies" },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
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
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
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

      {/* ================= TOP NAVBAR ================= */}
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 font-bold text-lg hidden sm:inline">
                CPulse
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === "/dashboard"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                {token && user && (user.role === "manager" || user.role === "admin") && (
                  <Link
                    to="/manage"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === "/manage"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                        : "text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent"
                    }`}
                  >
                    Manage
                  </Link>
                )}
                {token && user && user.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === "/admin"
                        ? "bg-red-500/15 text-red-300 border border-red-500/20"
                        : "text-red-400/70 hover:text-red-300 hover:bg-red-500/10 border border-transparent"
                    }`}
                  >
                    Admin
                  </Link>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="hidden sm:inline-flex text-sm px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              >
                {darkMode ? "\u2600\uFE0F" : "\uD83C\uDF19"}
              </button>

              {/* Auth */}
              {!token ? (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/25 hover:border-indigo-500/40 transition-all"
                >
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Login</span>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(user?.displayName || user?.email || "U")[0].toUpperCase()}
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-red-400/80 hover:text-red-400 px-2.5 py-1.5 rounded-lg bg-red-500/[0.06] border border-red-500/10 hover:border-red-500/20 transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.12] flex items-center justify-center transition-all"
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
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === "/dashboard"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                {token && user && (user.role === "manager" || user.role === "admin") && (
                  <Link
                    to="/manage"
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === "/manage"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                        : "text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent"
                    }`}
                  >
                    Manage
                  </Link>
                )}
                {token && user && user.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === "/admin"
                        ? "bg-red-500/15 text-red-300 border border-red-500/20"
                        : "text-red-400/70 hover:text-red-300 hover:bg-red-500/10 border border-transparent"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              <div className="flex items-center gap-1.5 px-3 py-2 mt-1 border-t border-white/[0.06]">
                <button onClick={toggleDarkMode} className="text-sm px-2.5 py-1.5 rounded bg-white/[0.04] border border-white/[0.06]">
                  {darkMode ? "\u2600\uFE0F" : "\uD83C\uDF19"}
                </button>
                {token && (
                  <button
                    onClick={logout}
                    className="ml-auto text-xs text-red-400/80 hover:text-red-400 px-2.5 py-1.5 rounded bg-red-500/[0.06] border border-red-500/10"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="mx-auto px-4 sm:px-6 py-6 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<UserSearch />} />
          <Route path="/leaderboard" element={<EnhancedLeaderboard />} />
          <Route path="/college" element={<CollegeDashboard />} />
          <Route path="/growth/:platform/:username" element={<PersonalGrowth />} />
          <Route path="/codechef/:username" element={<EnhancedCodeChefStats />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/problem-of-day" element={<ProblemOfTheDay />} />
          <Route path="/contests" element={<ContestCalendar />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:slug" element={<CompanyDetails />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/onboarding" element={token ? <Onboarding /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={token ? <UserDashboard /> : <Navigate to="/login" />} />
            <Route path="/manage" element={token ? <ManagerPanel /> : <Navigate to="/login" />} />
            <Route path="/admin" element={token ? <AdminPanel /> : <Navigate to="/login" />} />
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
