import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Trophy,
  Search,
  School,
  ArrowUpRight,
  TrendingUp,
  Zap,
} from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  handle: string;
  platform: string;
  rating: number;
  cpulseRating: number;
  totalSolved: number;
}

interface CollegeInfo {
  _id: string;
  name: string;
  code: string;
  description?: string;
  courseCount?: number;
  memberCount?: number;
}

interface CourseInfo {
  _id: string;
  name: string;
  code: string;
  description?: string;
  memberCount?: number;
}

export default function CollegeDashboard() {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<CollegeInfo[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<CollegeInfo | null>(null);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  // If user has a course, auto-select it
  useEffect(() => {
    if (user?.college && user?.course && colleges.length > 0) {
      const college = colleges.find(c => c._id === user.collegeId);
      if (college) {
        setSelectedCollege(college);
        fetchCourses(college._id, user.courseId || undefined);
      }
    }
  }, [user, colleges]); // eslint-disable-line

  const fetchColleges = async () => {
    try {
      const res = await api.get("/api/colleges");
      setColleges(res.data.colleges);
    } catch {}
  };

  const fetchCourses = async (collegeId: string, autoSelectCourseId?: string) => {
    try {
      const res = await api.get(`/api/colleges/${collegeId}/courses`);
      setCourses(res.data.courses);
      if (autoSelectCourseId) {
        setSelectedCourse(autoSelectCourseId);
        fetchLeaderboard(autoSelectCourseId);
      } else if (res.data.courses.length > 0) {
        setSelectedCourse(res.data.courses[0]._id);
        fetchLeaderboard(res.data.courses[0]._id);
      }
    } catch {}
  };

  const handleSelectCollege = (college: CollegeInfo) => {
    setSelectedCollege(college);
    setSelectedCourse("");
    setLeaderboard([]);
    fetchCourses(college._id);
  };

  const fetchLeaderboard = async (courseId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/courses/${courseId}/leaderboard`);
      setLeaderboard(res.data.leaderboard);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
    fetchLeaderboard(courseId);
  };

  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const currentCourse = courses.find((c) => c._id === selectedCourse);

  return (
    <div className="min-h-screen p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-100 mb-2">
                <School size={20} />
                <span className="text-sm font-medium tracking-wider uppercase">
                  College Dashboard
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                {selectedCollege ? selectedCollege.name : "Browse Colleges"}
              </h1>
              <p className="text-indigo-100 max-w-xl text-lg opacity-90">
                {selectedCollege
                  ? `${selectedCollege.courseCount || courses.length} courses, ${selectedCollege.memberCount || 0} members`
                  : "Explore colleges and course leaderboards"}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64 pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 transition-all font-medium"
                />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            {/* College List */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4 font-bold text-gray-400 uppercase text-xs tracking-widest">
                <School size={14} />
                {selectedCollege ? "Courses" : "Colleges"}
              </div>

              {!selectedCollege ? (
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredColleges.length > 0 ? (
                    filteredColleges.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => handleSelectCollege(c)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all hover:bg-indigo-500/10 hover:border-indigo-500/20 text-gray-300 hover:text-white border border-transparent"
                      >
                        <div>
                          <span className="font-semibold block">{c.name}</span>
                          <span className="text-xs text-gray-500">{c.code}</span>
                        </div>
                        <span className="text-xs text-gray-500">{c.courseCount || 0}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No colleges found
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                  <button
                    onClick={() => {
                      setSelectedCollege(null);
                      setSelectedCourse("");
                      setLeaderboard([]);
                      setCourses([]);
                    }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    All Colleges
                  </button>
                  {courses.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => handleSelectCourse(c._id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                        selectedCourse === c._id
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                          : "hover:bg-white/5 text-gray-300 hover:text-white"
                      }`}
                    >
                      <div>
                        <span className="font-semibold block">{c.name}</span>
                        <span className="text-xs opacity-60">{c.code}</span>
                      </div>
                      <span className="text-xs opacity-60">{c.memberCount || 0}</span>
                    </button>
                  ))}
                  {courses.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No courses yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-800/50 rounded-3xl" />
                  ))}
                </div>
                <div className="h-96 bg-gray-800/50 rounded-3xl" />
              </div>
            ) : selectedCourse && currentCourse ? (
              <>
                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    icon={<Users className="text-blue-400" />}
                    label="Members"
                    value={leaderboard.length}
                    sub={currentCourse.name}
                    color="blue"
                  />
                  <StatsCard
                    icon={<TrendingUp className="text-emerald-400" />}
                    label="Avg CPulse"
                    value={
                      leaderboard.length > 0
                        ? Math.round(
                            leaderboard.reduce((s, l) => s + l.cpulseRating, 0) /
                              leaderboard.length
                          )
                        : 0
                    }
                    sub="Course Average"
                    color="emerald"
                  />
                  <StatsCard
                    icon={<Zap className="text-amber-400" />}
                    label="Top Rating"
                    value={
                      leaderboard.length > 0
                        ? Math.max(...leaderboard.map((l) => l.cpulseRating))
                        : 0
                    }
                    sub="Highest CPulse"
                    color="amber"
                  />
                </div>

                {/* LEADERBOARD */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/10">
                  <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/15 rounded-lg text-amber-400">
                        <Trophy size={20} />
                      </div>
                      <h2 className="text-xl font-bold">Course Leaderboard</h2>
                    </div>
                    <div className="px-4 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-xs font-bold uppercase tracking-widest">
                      {currentCourse.code}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                          <th className="px-8 py-5">Rank</th>
                          <th className="px-8 py-5">Student</th>
                          <th className="px-8 py-5">Platform</th>
                          <th className="px-8 py-5 text-right">Rating</th>
                          <th className="px-8 py-5 text-right">CPulse</th>
                          <th className="px-8 py-5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.length > 0 ? (
                          leaderboard.map((student, i) => (
                            <tr
                              key={`${student.handle}-${student.platform}`}
                              className="group hover:bg-white/[0.02] transition-colors border-b last:border-0 border-white/5"
                            >
                              <td className="px-8 py-5">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                    i === 0
                                      ? "bg-amber-500/20 text-amber-400"
                                      : i === 1
                                      ? "bg-gray-500/20 text-gray-300"
                                      : i === 2
                                      ? "bg-orange-500/20 text-orange-400"
                                      : "text-gray-500 bg-gray-800/50"
                                  }`}
                                >
                                  {i + 1}
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div>
                                  <span className="font-semibold text-white">{student.displayName}</span>
                                  <span className="text-xs text-gray-500 ml-2">@{student.handle}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[11px] uppercase font-bold tracking-wide ${
                                    student.platform === "codeforces"
                                      ? "bg-blue-500/15 text-blue-400"
                                      : student.platform === "leetcode"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-orange-500/15 text-orange-400"
                                  }`}
                                >
                                  {student.platform}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right font-medium text-gray-400 tabular-nums">
                                {student.rating || "-"}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span className="font-bold text-indigo-400 tabular-nums">
                                  {student.cpulseRating}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <a
                                  href={`/growth/${student.platform}/${student.handle}`}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <ArrowUpRight size={16} />
                                </a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                              No members in this course yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-white/10">
                <div className="p-6 bg-gray-800 rounded-full mb-6">
                  <School size={48} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {selectedCollege ? "Select a Course" : "Select a College"}
                </h3>
                <p className="text-gray-500">
                  {selectedCollege
                    ? "Choose a course to view its leaderboard."
                    : "Choose a college from the list to explore."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20",
    emerald: "bg-emerald-500/10 border-emerald-500/20",
    amber: "bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border ${colorClasses[color] || "border-white/10"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-gray-900/50">{icon}</div>
      </div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
      <p className="text-sm text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
