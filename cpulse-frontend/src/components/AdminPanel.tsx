import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface UserItem {
  _id: string;
  email: string;
  displayName?: string;
  role: string;
  collegeId?: string;
  courseId?: string;
  createdAt: string;
}

interface CollegeItem {
  _id: string;
  name: string;
  code: string;
  description?: string;
  managers?: { _id: string; displayName?: string; email: string }[];
  courseCount?: number;
  memberCount?: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"colleges" | "users">("colleges");
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // College form
  const [showNewCollege, setShowNewCollege] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeDesc, setCollegeDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Manager assignment
  const [addingManagerFor, setAddingManagerFor] = useState<string | null>(null);
  const [managerEmail, setManagerEmail] = useState("");

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchColleges();
    fetchUsers();
  }, []); // eslint-disable-line

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/colleges");
      // Fetch details to get managers
      const detailed: CollegeItem[] = [];
      for (const c of res.data.colleges) {
        try {
          const d = await api.get(`/api/colleges/${c._id}`);
          detailed.push({ ...d.data.college, courseCount: c.courseCount, memberCount: c.memberCount });
        } catch {
          detailed.push(c);
        }
      }
      setColleges(detailed);
    } catch {} finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch {}
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim() || !collegeCode.trim()) return;
    setFormLoading(true);
    setError("");
    try {
      await api.post("/api/colleges", {
        name: collegeName.trim(),
        code: collegeCode.trim(),
        description: collegeDesc.trim() || undefined,
      });
      setCollegeName("");
      setCollegeCode("");
      setCollegeDesc("");
      setShowNewCollege(false);
      fetchColleges();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create college");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCollege = async (id: string) => {
    if (!window.confirm("Delete this college? All courses and member associations will be removed.")) return;
    try {
      await api.delete(`/api/colleges/${id}`);
      fetchColleges();
    } catch {}
  };

  const handleAddManager = async (collegeId: string) => {
    if (!managerEmail.trim()) return;
    setError("");
    // Find user by email
    const targetUser = users.find(u => u.email.toLowerCase() === managerEmail.trim().toLowerCase());
    if (!targetUser) {
      setError("User not found with that email");
      return;
    }
    try {
      await api.post(`/api/colleges/${collegeId}/managers`, { userId: targetUser._id });
      setManagerEmail("");
      setAddingManagerFor(null);
      fetchColleges();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add manager");
    }
  };

  const handleRemoveManager = async (collegeId: string, userId: string) => {
    try {
      await api.delete(`/api/colleges/${collegeId}/managers/${userId}`);
      fetchColleges();
      fetchUsers();
    } catch {}
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change role");
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.displayName?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-red-500/25">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-0.5">Manage colleges, managers, and users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["colleges", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t
                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            {t === "colleges" ? `Colleges (${colleges.length})` : `Users (${users.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-3 text-red-300 hover:text-red-200 font-bold">x</button>
        </div>
      )}

      {/* Colleges Tab */}
      {tab === "colleges" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowNewCollege(!showNewCollege)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            {showNewCollege ? "Cancel" : "+ New College"}
          </button>

          {showNewCollege && (
            <form onSubmit={handleCreateCollege} className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="College Name"
                  required
                  className="px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                />
                <input
                  type="text"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  placeholder="College Code (e.g. MIT, IITD)"
                  required
                  className="px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <input
                type="text"
                value={collegeDesc}
                onChange={(e) => setCollegeDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-50"
              >
                {formLoading ? "Creating..." : "Create College"}
              </button>
            </form>
          )}

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-800/50 rounded-xl" />)}
            </div>
          ) : colleges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No colleges. Create one above.</p>
          ) : (
            colleges.map((college) => (
              <div key={college._id} className="bg-gray-800/50 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-semibold text-lg">{college.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({college.code})</span>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>{college.courseCount || 0} courses</span>
                      <span>{college.memberCount || 0} members</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCollege(college._id)}
                    className="text-xs text-red-400 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>

                {/* Managers */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Managers</span>
                    <button
                      onClick={() => setAddingManagerFor(addingManagerFor === college._id ? null : college._id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {addingManagerFor === college._id ? "Cancel" : "+ Add Manager"}
                    </button>
                  </div>

                  {addingManagerFor === college._id && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="email"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="User email"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => handleAddManager(college._id)}
                        className="px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-sm hover:bg-indigo-500/25"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {college.managers && college.managers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {college.managers.map((m) => (
                        <div key={m._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <span className="text-sm text-purple-300">{m.displayName || m.email}</span>
                          <button
                            onClick={() => handleRemoveManager(college._id, m._id)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No managers assigned</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-4">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users by email or name..."
            className="w-full max-w-md px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-white font-medium">{u.displayName || "N/A"}</span>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        u.role === "admin" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                        u.role === "manager" ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" :
                        "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u._id !== user!.id && (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg bg-gray-900/50 border border-white/10 text-white outline-none"
                        >
                          <option value="user">user</option>
                          <option value="manager">manager</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
