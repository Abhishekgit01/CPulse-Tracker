import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Plus, Search, Building2 } from "lucide-react";

interface Company {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    problemCount: number;
}

export default function Companies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const [newCompanyLogo, setNewCompanyLogo] = useState("");
    const [newCompanyDesc, setNewCompanyDesc] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/companies");
            setCompanies(res.data);
        } catch (error) {
            console.error("Failed to fetch companies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName) return;

        try {
            setSubmitting(true);
            await api.post("/api/companies", {
                name: newCompanyName,
                logo: newCompanyLogo,
                description: newCompanyDesc,
            });
            setShowAddModal(false);
            setNewCompanyName("");
            setNewCompanyLogo("");
            setNewCompanyDesc("");
            fetchCompanies();
        } catch (error) {
            alert("Failed to create company");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCompanies = companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin text-4xl">⚙️</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Company Interview Questions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Practice problems specifically asked by top tech companies
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Add Company
                </button>
            </div>

            <div className="relative">
                <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                />
                <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                    <Link
                        key={company._id}
                        to={`/companies/${company.slug}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden p-2">
                                {company.logo && !imgErrors[company._id] ? (
                                    <img
                                        src={company.logo}
                                        alt={company.name}
                                        className="w-full h-full object-contain"
                                        onError={() => setImgErrors(prev => ({ ...prev, [company._id]: true }))}
                                    />
                                ) : (
                                    <Building2 size={32} className="text-gray-400" />
                                )}
                            </div>
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                                {company.problemCount} Problems
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {company.name}
                        </h3>

                        {company.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                                {company.description}
                            </p>
                        )}
                    </Link>
                ))}

                {filteredCompanies.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        No companies found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Company</h2>
                        <form onSubmit={handleAddCompany} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newCompanyName}
                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Google"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Logo URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={newCompanyLogo}
                                    onChange={(e) => setNewCompanyLogo(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newCompanyDesc}
                                    onChange={(e) => setNewCompanyDesc(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="Brief description of the company..."
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
                                    {submitting ? "Creating..." : "Create Company"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
