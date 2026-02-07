import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface CourseItem {
  _id: string;
  name: string;
  code: string;
  description?: string;
  memberCount: number;
}

interface PendingRequest {
  _id: string;
  userId: { _id: string; displayName?: string; email: string };
  courseId: { _id: string; name: string; code: string };
  message?: string;
  requestedAt: string;
}

interface ManagedCollege {
  _id: string;
  name: string;
  code: string;
}

export default function ManagerPanel() {
  const { user } = useAuth();
  const [managedColleges, setManagedColleges] = useState<ManagedCollege[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [tab, setTab] = useState<"courses" | "requests" | "members">("courses");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New course form
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchManagedColleges();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (selectedCollege) {
      fetchCourses();
      fetchRequests();
    }
  }, [selectedCollege]); // eslint-disable-line

  const fetchManagedColleges = async () => {
    try {
      const res = await api.get("/api/colleges");
      // For admin, show all colleges. For manager, filter managed ones.
      if (user!.role === "admin") {
        setManagedColleges(res.data.colleges);
      } else {
        // Managers: need to check which colleges they manage
        // The college detail endpoint has managers list
        const all = res.data.colleges;
        const managed: ManagedCollege[] = [];
        for (const c of all) {
          try {
            const detail = await api.get(`/api/colleges/${c._id}`);
            const managers = detail.data.college.managers || [];
            if (managers.some((m: any) => m._id === user!.id)) {
              managed.push(c);
            }
          } catch {}
        }
        setManagedColleges(managed);
      }
      if (res.data.colleges.length > 0 && !selectedCollege) {
        // Auto-select first college
        if (user!.role === "admin") {
          setSelectedCollege(res.data.colleges[0]._id);
        }
      }
    } catch {}
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/colleges/${selectedCollege}/courses`);
      setCourses(res.data.courses);
    } catch {} finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get(`/api/join-requests/college/${selectedCollege}`);
      setRequests(res.data.requests);
    } catch {}
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !courseCode.trim()) return;
    setFormLoading(true);
    setError("");
    try {
      await api.post(`/api/colleges/${selectedCollege}/courses`, {
        name: courseName.trim(),
        code: courseCode.trim(),
        description: courseDesc.trim() || undefined,
      });
      setCourseName("");
      setCourseCode("");
      setCourseDesc("");
      setShowNewCourse(false);
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Delete this course? All members will be removed.")) return;
    try {
      await api.delete(`/api/courses/${courseId}`);
      fetchCourses();
    } catch {}
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/api/join-requests/${requestId}/approve`);
      fetchRequests();
      fetchCourses();
    } catch {}
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.post(`/api/join-requests/${requestId}/reject`);
      fetchRequests();
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/25">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Manager Panel</h1>
          <p className="text-gray-400 mt-0.5">Manage courses and join requests</p>
        </div>
      </div>

      {/* College Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Select College</label>
        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white w-full max-w-xs focus:border-indigo-500 outline-none"
        >
          <option value="">-- Select College --</option>
          {managedColleges.map((c) => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      {selectedCollege && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["courses", "requests"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                {t === "courses" ? `Courses (${courses.length})` : `Requests (${requests.length})`}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Courses Tab */}
          {tab === "courses" && (
            <div className="space-y-4">
              <button
                onClick={() => setShowNewCourse(!showNewCourse)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                {showNewCourse ? "Cancel" : "+ New Course"}
              </button>

              {showNewCourse && (
                <form onSubmit={handleCreateCourse} className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Course Name"
                      required
                      className="px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="Course Code (e.g. CS-2024-A)"
                      required
                      className="px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-50"
                  >
                    {formLoading ? "Creating..." : "Create Course"}
                  </button>
                </form>
              )}

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-800/50 rounded-xl" />)}
                </div>
              ) : courses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No courses yet. Create one above.</p>
              ) : (
                courses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between px-4 py-4 rounded-xl bg-gray-800/50 border border-white/5">
                    <div>
                      <span className="text-white font-medium">{course.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({course.code})</span>
                      <span className="text-xs text-gray-500 ml-3">{course.memberCount} members</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-xs text-red-400 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {tab === "requests" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending requests.</p>
              ) : (
                requests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between px-4 py-4 rounded-xl bg-gray-800/50 border border-white/5">
                    <div>
                      <span className="text-white font-medium">
                        {req.userId.displayName || req.userId.email}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">wants to join</span>
                      <span className="text-indigo-400 font-medium ml-2">
                        {req.courseId?.name || "N/A"}
                      </span>
                      {req.message && (
                        <p className="text-xs text-gray-400 mt-1">"{req.message}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="text-xs text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="text-xs text-red-400 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
