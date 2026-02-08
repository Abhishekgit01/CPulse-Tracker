import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ────────── types ────────── */
interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface DSAQuestion {
  id: string;
  title: string;
  platform: "LeetCode" | "Codeforces" | "CodeChef";
  platformUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  hint1: string;
  hint2: string;
  solutionParts: [string, string, string];
  fullExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
}

interface RunResult {
  output: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  compileOutput: string;
  compileError: string;
}

type Phase = "setup" | "solving" | "review";
type SolvingTab = "problem" | "code";

const DIFF_COLOR: Record<string, string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const TIMER_DEFAULTS: Record<string, number> = {
  Easy: 15 * 60,
  Medium: 25 * 60,
  Hard: 40 * 60,
};

const TOPICS = [
  "Arrays", "Strings", "Hash Table", "Two Pointers", "Sliding Window",
  "Binary Search", "Linked List", "Stack", "Queue", "Trees",
  "Binary Search Tree", "Heap / Priority Queue", "Graphs", "BFS", "DFS",
  "Dynamic Programming", "Greedy", "Backtracking", "Recursion",
  "Sorting", "Bit Manipulation", "Math", "Trie", "Union Find",
];

const PLATFORM_COLORS: Record<string, string> = {
  LeetCode: "#f89f1b",
  Codeforces: "#1890ff",
  CodeChef: "#5b4638",
};

const LANGUAGES = [
  { id: "cpp", name: "C++", monacoId: "cpp" },
  { id: "c", name: "C", monacoId: "c" },
  { id: "python", name: "Python", monacoId: "python" },
  { id: "java", name: "Java", monacoId: "java" },
  { id: "javascript", name: "JavaScript", monacoId: "javascript" },
];

const DEFAULT_CODE: Record<string, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`,
  python: `# Write your code here
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
  javascript: `// Write your code here
`,
};

/* ────────── helpers ────────── */
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function pct(elapsed: number, total: number) {
  return Math.min((elapsed / total) * 100, 100);
}

/* ────────── component ────────── */
export default function DSAPractice() {
  /* setup state */
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [topic, setTopic] = useState<string>("");
  const [customTime, setCustomTime] = useState<number>(0); // 0 = default

  /* question & phase */
  const [question, setQuestion] = useState<DSAQuestion | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* code editor */
  const [solvingTab, setSolvingTab] = useState<SolvingTab>("problem");
  const [lang, setLang] = useState("cpp");
  const [code, setCode] = useState(DEFAULT_CODE["cpp"]);
  const [stdin, setStdin] = useState("");
  const [runOutput, setRunOutput] = useState("");
  const [running, setRunning] = useState(false);

  /* timer */
  const [totalTime, setTotalTime] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* reveals */
  const [revealedParts, setRevealedParts] = useState(0); // 0, 1, 2, 3
  const [hintsUsed, setHintsUsed] = useState(0); // 0, 1, 2
  const [showExplanation, setShowExplanation] = useState(false);
  const [autoRevealed, setAutoRevealed] = useState<Set<number>>(new Set());

  const elapsed = totalTime - remaining;
  const progress = totalTime > 0 ? pct(elapsed, totalTime) : 0;

  /* ── timer tick ── */
  useEffect(() => {
    if (phase !== "solving" || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, paused]);

  /* ── auto-reveal on timer thresholds ── */
  useEffect(() => {
    if (phase !== "solving" || totalTime === 0) return;

    // At 50% elapsed → reveal part 1
    if (progress >= 50 && !autoRevealed.has(1)) {
      setRevealedParts((p) => Math.max(p, 1));
      setAutoRevealed((s) => new Set(s).add(1));
    }
    // At 75% elapsed → reveal part 2
    if (progress >= 75 && !autoRevealed.has(2)) {
      setRevealedParts((p) => Math.max(p, 2));
      setAutoRevealed((s) => new Set(s).add(2));
    }
    // At 100% → reveal all + enter review
    if (remaining === 0) {
      setRevealedParts(3);
      setPhase("review");
    }
  }, [progress, remaining, phase, totalTime, autoRevealed]);

  /* ── generate question ── */
  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/dsa-practice/generate`, {
          difficulty,
          topic: topic || undefined,
        });
      setQuestion(res.data);
      const t = customTime > 0 ? customTime * 60 : TIMER_DEFAULTS[difficulty] || 25 * 60;
      setTotalTime(t);
      setRemaining(t);
      setRevealedParts(0);
      setHintsUsed(0);
      setShowExplanation(false);
      setAutoRevealed(new Set());
      setPaused(false);
      setPhase("solving");
      } catch (e: any) {
        const msg = e.response?.data?.error || e.message;
        setError(
          e.response?.status === 429
            ? "AI rate limit reached. Please wait 10-15 seconds and try again."
            : msg
        );
    } finally {
      setLoading(false);
    }
  }, [difficulty, topic, customTime]);

  /* ── use hint (consumes time) ── */
  const useHint = (hintNum: 1 | 2) => {
    if (hintNum === 1 && hintsUsed < 1) {
      // Hint 1: jump to 50% elapsed if below
      setHintsUsed(1);
      const halfTime = Math.floor(totalTime / 2);
      if (remaining > halfTime) {
        setRemaining(halfTime);
      }
    } else if (hintNum === 2 && hintsUsed < 2) {
      // Hint 2: jump to 75% elapsed
      setHintsUsed(2);
      const quarterTime = Math.floor(totalTime / 4);
      if (remaining > quarterTime) {
        setRemaining(quarterTime);
      }
    }
  };

  /* ── manual reveal (costs time like hints) ── */
  const manualReveal = () => {
    if (revealedParts === 0) {
      // Jump to 50%
      const halfTime = Math.floor(totalTime / 2);
      if (remaining > halfTime) setRemaining(halfTime);
      setRevealedParts(1);
    } else if (revealedParts === 1) {
      // Jump to 75%
      const quarterTime = Math.floor(totalTime / 4);
      if (remaining > quarterTime) setRemaining(quarterTime);
      setRevealedParts(2);
    } else if (revealedParts === 2) {
      setRevealedParts(3);
      setPhase("review");
    }
  };

  /* ── give up ── */
  const giveUp = () => {
    setRevealedParts(3);
    setRemaining(0);
    setPhase("review");
  };

  /* ── new question ── */
  const reset = () => {
    setPhase("setup");
    setQuestion(null);
    setRevealedParts(0);
    setHintsUsed(0);
    setShowExplanation(false);
    setAutoRevealed(new Set());
    setSolvingTab("problem");
    setCode(DEFAULT_CODE[lang]);
    setStdin("");
    setRunOutput("");
  };

  /* ── run code ── */
  const runCode = useCallback(async () => {
    setRunning(true);
    setRunOutput("");
    try {
      const res = await axios.post(`${API}/api/dsa-practice/run`, {
        code,
        language: lang,
        stdin,
      });
      const d = res.data;
      let output = "";
      if (d.compileError) output += `[Compile Error]\n${d.compileError}\n`;
      else if (d.compileOutput) output += `[Compile]\n${d.compileOutput}\n`;
      if (d.stderr) output += `[Stderr]\n${d.stderr}\n`;
      if (d.stdout) output += d.stdout;
      else if (!d.stderr && !d.compileError) output += d.output || "(no output)";
      setRunOutput(output.trim());
    } catch (e: any) {
      setRunOutput(e.response?.data?.error || e.message || "Execution failed");
    } finally {
      setRunning(false);
    }
  }, [code, lang, stdin]);

  /* ━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━ */

  /* ── SETUP PHASE ── */
  if (phase === "setup") {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            DSA Practice Arena
          </h1>
          <p className="text-gray-400 text-sm">
            Solve a timed DSA problem. Solutions are progressively revealed as time passes.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                    difficulty === d
                      ? `border-current bg-opacity-20`
                      : "border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                  style={difficulty === d ? { color: DIFF_COLOR[d], backgroundColor: DIFF_COLOR[d] + "20" } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Topic (optional)</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">Random</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

            {/* Timer */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timer (minutes) — default: {TIMER_DEFAULTS[difficulty] / 60}m
            </label>
            <input
              type="number"
              min={5}
              max={120}
              placeholder={`${TIMER_DEFAULTS[difficulty] / 60}`}
              value={customTime || ""}
              onChange={(e) => setCustomTime(Number(e.target.value))}
              className="w-32 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Start */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Loading Problem...
                </span>
              ) : (
                "Start Practice"
              )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Rules */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">How it works</h3>
              <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
                <li>Questions are sourced from <strong className="text-indigo-400">LeetCode</strong>, <strong className="text-blue-400">Codeforces</strong>, and <strong className="text-amber-400">CodeChef</strong></li>
              <li>At <strong className="text-amber-400">50% time elapsed</strong>, the first 1/3 of the solution is auto-revealed</li>
              <li>At <strong className="text-orange-400">75% time elapsed</strong>, the second 1/3 is auto-revealed</li>
              <li>At <strong className="text-red-400">100% time elapsed</strong>, the full solution is shown</li>
              <li>Using a <strong className="text-indigo-400">hint</strong> or <strong className="text-indigo-400">manual reveal</strong> will fast-forward the timer to the next threshold</li>
              <li>Try to solve it before any reveals!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  /* ── progress bar color ── */
  const barColor =
    progress < 50 ? "from-green-500 to-emerald-400" :
    progress < 75 ? "from-amber-500 to-yellow-400" :
    "from-red-500 to-orange-400";

  const timerColor =
    progress < 50 ? "text-green-400" :
    progress < 75 ? "text-amber-400" :
    "text-red-400";

  /* ── SOLVING / REVIEW ── */
  return (
    <div className="max-w-5xl mx-auto py-6 space-y-5">
      {/* ── TOP BAR: Timer + Controls ── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-gray-100">{question.title}</h2>
              <a
                href={question.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded text-xs font-bold hover:opacity-80 transition-opacity"
                style={{ color: PLATFORM_COLORS[question.platform] || "#fff", backgroundColor: (PLATFORM_COLORS[question.platform] || "#fff") + "20" }}
              >
                {question.platform}
              </a>
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{ color: DIFF_COLOR[question.difficulty], backgroundColor: DIFF_COLOR[question.difficulty] + "20" }}
              >
                {question.difficulty}
              </span>
              {question.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded text-xs bg-white/[0.05] text-gray-400 border border-white/[0.06]">
                  {tag}
                </span>
              ))}
            </div>
          <div className="flex items-center gap-2">
            {phase === "solving" && (
              <>
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/[0.05] transition-all"
                >
                  {paused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={giveUp}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Give Up
                </button>
              </>
            )}
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              New Problem
            </button>
          </div>
        </div>

        {/* Timer bar */}
        <div className="relative h-3 bg-white/[0.04] rounded-full overflow-hidden mb-2">
          <div
            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-linear`}
            style={{ width: `${progress}%` }}
          />
          {/* Threshold markers */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-amber-400/50" title="50% - Part 1 reveal" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-orange-400/50" title="75% - Part 2 reveal" />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Elapsed: {fmt(elapsed)}</span>
          <span className={`text-lg font-mono font-bold ${timerColor}`}>
            {fmt(remaining)}
          </span>
          <span>Total: {fmt(totalTime)}</span>
        </div>

        {/* Phase indicator */}
        {phase === "review" && (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs text-center font-medium">
            Review Mode — Full solution and explanation available
          </div>
        )}
        {paused && phase === "solving" && (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-medium">
            Timer Paused
          </div>
        )}
      </div>

      {/* ── Tab switcher: Problem / Code ── */}
    <div className="flex gap-2">
      {(["problem", "code"] as SolvingTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setSolvingTab(tab)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
            solvingTab === tab
              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"
              : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
          }`}
        >
          {tab === "problem" ? "Problem" : "Code Editor"}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── LEFT: Problem Statement OR Code Editor ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Problem tab */}
          {solvingTab === "problem" && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Problem Statement</h3>
                <a
                  href={question.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/[0.05] transition-all"
                >
                  Solve on {question.platform} &rarr;
                </a>
              </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{question.description}</p>

            {/* Examples */}
            <div className="mt-4 space-y-3">
              {question.examples.map((ex, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-400 mb-1">Example {i + 1}</div>
                  <div className="text-xs text-gray-300 font-mono">
                    <div><span className="text-gray-500">Input: </span>{ex.input}</div>
                    <div><span className="text-gray-500">Output: </span>{ex.output}</div>
                    {ex.explanation && (
                      <div className="text-gray-500 mt-1">Explanation: {ex.explanation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            {question.constraints.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-400 mb-1">Constraints</div>
                <ul className="text-xs text-gray-500 space-y-0.5 list-disc list-inside font-mono">
                  {question.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          )}

          {/* Code Editor tab */}
          {solvingTab === "code" && (
            <div className="space-y-3">
              {/* Language selector + Run button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={lang}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setLang(newLang);
                      setCode(DEFAULT_CODE[newLang]);
                    }}
                    className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={runCode}
                  disabled={running}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {running ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                  {running ? "Running..." : "Run Code"}
                </button>
              </div>

              {/* Monaco Editor */}
              <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                <Editor
                  height="400px"
                  language={LANGUAGES.find((l) => l.id === lang)?.monacoId || "cpp"}
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                    lineNumbers: "on",
                    renderLineHighlight: "line",
                    wordWrap: "on",
                  }}
                />
              </div>

              {/* Stdin */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Input (stdin)</label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter test input here..."
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-indigo-500/50 resize-y"
                />
              </div>

              {/* Output */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Output</label>
                <pre className={`w-full min-h-[60px] max-h-[200px] overflow-auto bg-black/40 border rounded-lg px-3 py-2 text-sm font-mono whitespace-pre-wrap ${
                  runOutput.includes("[Compile Error]") || runOutput.includes("[Stderr]")
                    ? "border-red-500/20 text-red-300"
                    : "border-white/[0.06] text-green-300"
                }`}>
                  {runOutput || <span className="text-gray-600">Run your code to see output...</span>}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Hints + Solution Panels ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hints */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Hints</h3>

            {/* Hint 1 */}
            <div>
              {hintsUsed >= 1 ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                  <div className="font-semibold text-amber-400 mb-1">Hint 1</div>
                  {question.hint1}
                </div>
              ) : (
                <button
                  onClick={() => useHint(1)}
                  disabled={phase === "review"}
                  className="w-full p-3 rounded-lg text-xs font-medium border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition-all disabled:opacity-40 text-left"
                >
                  Show Hint 1 <span className="text-amber-500/50">(jumps timer to 50%)</span>
                </button>
              )}
            </div>

            {/* Hint 2 */}
            <div>
              {hintsUsed >= 2 ? (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
                  <div className="font-semibold text-orange-400 mb-1">Hint 2</div>
                  {question.hint2}
                </div>
              ) : (
                <button
                  onClick={() => useHint(2)}
                  disabled={phase === "review" || hintsUsed < 1}
                  className="w-full p-3 rounded-lg text-xs font-medium border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 transition-all disabled:opacity-40 text-left"
                >
                  Show Hint 2 <span className="text-orange-500/50">(jumps timer to 75%)</span>
                </button>
              )}
            </div>
          </div>

          {/* Solution Reveal */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Solution (C++)</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-6 h-1.5 rounded-full transition-all ${
                      revealedParts >= n ? "bg-indigo-500" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Revealed parts */}
            {revealedParts === 0 && phase === "solving" && (
              <div className="text-center py-6">
                <div className="text-gray-600 text-xs mb-3">
                  Solution is hidden. It will be revealed progressively as the timer advances.
                </div>
                <button
                  onClick={manualReveal}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                >
                  Reveal Part 1 (costs 50% of time)
                </button>
              </div>
            )}

            {revealedParts >= 1 && (
              <div className="relative">
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400">
                  1/3
                </div>
                <pre className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {question.solutionParts[0]}
                </pre>
              </div>
            )}

            {revealedParts >= 2 && (
              <div className="relative">
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                  2/3
                </div>
                <pre className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs text-amber-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {question.solutionParts[1]}
                </pre>
              </div>
            )}

            {revealedParts >= 3 && (
              <div className="relative">
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                  3/3
                </div>
                <pre className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs text-red-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {question.solutionParts[2]}
                </pre>
              </div>
            )}

            {/* Manual reveal button */}
            {revealedParts > 0 && revealedParts < 3 && phase === "solving" && (
              <button
                onClick={manualReveal}
                className="w-full py-2 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
              >
                {revealedParts === 1
                  ? "Reveal Part 2 (costs time to 75%)"
                  : "Reveal Part 3 (show full solution)"}
              </button>
            )}

            {/* Complexity */}
            {revealedParts >= 3 && (
              <div className="flex gap-3 mt-2">
                <div className="flex-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Time</div>
                  <div className="text-xs font-mono text-gray-300">{question.timeComplexity}</div>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Space</div>
                  <div className="text-xs font-mono text-gray-300">{question.spaceComplexity}</div>
                </div>
              </div>
            )}
          </div>

          {/* Full Explanation (review only) */}
          {phase === "review" && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <button
                onClick={() => setShowExplanation((s) => !s)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-300"
              >
                <span>Full Explanation</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${showExplanation ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showExplanation && (
                <div className="mt-3 text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {question.fullExplanation}
                </div>
              )}
            </div>
          )}

          {/* Session stats (review) */}
          {phase === "review" && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Session Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Time Used</div>
                  <div className="text-sm font-mono text-gray-200">{fmt(elapsed)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Hints Used</div>
                  <div className="text-sm font-mono text-gray-200">{hintsUsed} / 2</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Parts Before Timer</div>
                  <div className="text-sm font-mono text-gray-200">{Math.max(0, 3 - revealedParts)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Difficulty</div>
                  <div className="text-sm font-bold" style={{ color: DIFF_COLOR[question.difficulty] }}>
                    {question.difficulty}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
