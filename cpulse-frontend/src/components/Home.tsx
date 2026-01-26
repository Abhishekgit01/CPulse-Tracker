import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProblemOfTheDay from "./ProblemOfTheDay";

// --- Types ---
interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
}

const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  Trophy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  BarChart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
  ),
  Code: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
};

const WarpBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Fixes 'canvas is possibly null'

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Fixes 'ctx is possibly null'

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const starCount = 200;
    const speed = 0.5;
    const stars: Star[] = []; // Explicitly typed array

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        color: i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#c084fc" : "#38bdf8"
      });
    }

    let animationFrameId: number; // Typed as number

    const render = () => {
      ctx.fillStyle = "rgba(11, 17, 32, 0.4)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= speed * 10;
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
        }

        const x = cx + (star.x / star.z) * width;
        const y = cy + (star.y / star.z) * height;
        const size = (1 - star.z / width) * 4;

        ctx.beginPath();
        ctx.fillStyle = star.color;
        ctx.fillRect(x, y, size, size);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 bg-[#0B1120]"
    />
  );
};

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Typed 'e' as React.MouseEvent
  const handleMouseMove = (e: React.MouseEvent) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setMousePosition({
      x: (e.clientX - centerX) / 50,
      y: (e.clientY - centerY) / 50,
    });
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-x-hidden text-gray-900 dark:text-white selection:bg-indigo-500 selection:text-white"
      onMouseMove={handleMouseMove}
    >
      <WarpBackground />

      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0B1120]/80 via-transparent to-[#0B1120] pointer-events-none"></div>

      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          transition: "transform 0.1s ease-out"
        }}
      >
        <section className="flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center w-full max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-sm font-medium mb-8 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Leaderboards Active
          </div>

          <h1 className="max-w-5xl mx-auto text-6xl md:text-8xl font-extrabold tracking-tight mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              CPulse Tracker
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
            The ultimate dashboard for competitive programmers. Track performance across <span className="text-white font-bold underline decoration-indigo-500 decoration-2 underline-offset-4">Codeforces</span>, <span className="text-white font-bold underline decoration-yellow-600 decoration-2 underline-offset-4">CodeChef</span> and <span className="text-white font-bold underline decoration-purple-500 decoration-2 underline-offset-4">LeetCode</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <Link
              to="/search"
              className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(79,70,229,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Icons.Search />
                <span>Search User</span>
                <Icons.ArrowRight />
              </div>
            </Link>

            <div className="flex gap-4 w-full sm:w-auto">
              <Link to="/leaderboard" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold transition-all hover:bg-white/10 hover:-translate-y-1">
                <div className="text-yellow-400"><Icons.Trophy /></div> Global Ranks
              </Link>
              <Link to="/class" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold transition-all hover:bg-white/10 hover:-translate-y-1">
                <div className="text-blue-400"><Icons.Users /></div> Class Ranks
              </Link>
            </div>
          </div>
        </section>

        {/* Daily Problem Section */}
        <section className="py-20 px-4 w-full max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">📝 Problem of the Day</h2>
            <p className="text-gray-400">Challenge yourself with today's curated problem</p>
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <ProblemOfTheDay />
          </div>
        </section>

        {/* ... Rest of features and footer ... */}
        <section className="py-20 px-4 w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Level up your game</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative p-8 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 transition-all duration-300 hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6"><Icons.BarChart /></div>
              <h3 className="text-xl font-bold text-white mb-3">Comprehensive Stats</h3>
              <p className="text-gray-400">Detailed rating and rank tracking.</p>
            </div>
            <Link to="/class">
              <div className="group relative p-8 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-6"><Icons.Code /></div>
                <h3 className="text-xl font-bold text-white mb-3">Competitive Context</h3>
                <p className="text-gray-400">Class and friend leaderboards.</p>
              </div>
            </Link>
            <div className="group relative p-8 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 transition-all duration-300 hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mb-6"><Icons.Zap /></div>
              <h3 className="text-xl font-bold text-white mb-3">Blazing Fast</h3>
              <p className="text-gray-400">Optimized caching for speed.</p>
            </div>
          </div>
        </section>

        <footer className="w-full border-t border-white/10 bg-black/20 backdrop-blur-lg mt-10">
          <div className="max-w-7xl mx-auto py-8 px-4 flex justify-between items-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} CPulse Tracker.</p>
          </div>
        </footer>
      </div>
    </div >
  );
}