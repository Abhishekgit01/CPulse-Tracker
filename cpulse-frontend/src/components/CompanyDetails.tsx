import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
    ArrowLeft,
    ExternalLink,
    Plus,
    Trash2,
    Calendar,
    Building2
} from "lucide-react";

interface Problem {
    _id: string;
    problemTitle: string;
    problemUrl: string;
    platform: "codeforces" | "leetcode" | "codechef";
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    dateAsked?: string;
    notes?: string;
}

interface Company {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
    codeforces: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    codechef: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    leetcode: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function CompanyDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imgError, setImgError] = useState(false);

    const [formData, setFormData] = useState({
        problemTitle: "",
        problemUrl: "",
        platform: "leetcode",
        difficulty: "Medium",
        tags: "",
        notes: "",
    });

    useEffect(() => {
        fetchCompanyDetails();
    }, [slug]);

    const fetchCompanyDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/companies/${slug}`);
            setCompany(res.data.company);
            setProblems(res.data.problems);
        } catch (error) {
            console.error("Failed to fetch company details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProblem = async (problemId: string) => {
        if (!window.confirm("Are you sure you want to remove this problem?")) return;

        try {
            await api.delete(`/api/companies/${slug}/problems/${problemId}`);
            setProblems(problems.filter(p => p._id !== problemId));
        } catch (error) {
            alert("Failed to delete problem");
        }
    };

    const handleAddProblem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.problemTitle || !formData.problemUrl) return;

        try {
            setSubmitting(true);
            const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await api.post(`/api/companies/${slug}/problems`, {
                ...formData,
                tags: tagsArray,
                dateAsked: new Date(),
            });

            setProblems([res.data.problem, ...problems]);
            setShowAddModal(false);
            setFormData({
                problemTitle: "",
                problemUrl: "",
                platform: "leetcode",
                difficulty: "Medium",
                tags: "",
                notes: "",
            });
        } catch (error) {
            alert("Failed to add problem");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin text-4xl">⚙️</div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Company not found</h2>
                <button onClick={() => navigate("/companies")} className="mt-4 text-blue-600 hover:underline">
                    Back to Companies
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <Link
                to="/companies"
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Companies
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-4">
                    {company.logo && !imgError ? (
                        <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <Building2 size={40} className="text-gray-400" />
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {company.name}
                    </h1>
                    {company.description && (
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                            {company.description}
                        </p>
                    )}
                    <div className="mt-4 flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            Updated recently
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Add Problem
                </button>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Asked Questions ({problems.length})
                </h2>

                {problems.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No problems added yet.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-blue-600 hover:underline"
                        >
                            Be the first to add one!
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {problems.map(problem => (
                            <div
                                key={problem._id}
                                className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition group relative"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PLATFORM_COLORS[problem.platform]}`}>
                                                {problem.platform}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>

                                        <a
                                            href={problem.problemUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                                        >
                                            {problem.problemTitle}
                                            <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition" />
                                        </a>

                                        {problem.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {problem.tags.map(tag => (
                                                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleDeleteProblem(problem._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Remove problem"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <a
                                            href={problem.problemUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                        >
                                            Solve
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add Company Question</h2>
                        <form onSubmit={handleAddProblem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Problem Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.problemTitle}
                                    onChange={(e) => setFormData({ ...formData, problemTitle: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Invert Binary Tree"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Problem URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.problemUrl}
                                    onChange={(e) => setFormData({ ...formData, problemUrl: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://leetcode.com/..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Platform
                                    </label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="leetcode">LeetCode</option>
                                        <option value="codeforces">Codeforces</option>
                                        <option value="codechef">CodeChef</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Array, Tree, DP"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                    placeholder="Any helpful tips..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {submitting ? "Adding..." : "Add Problem"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
