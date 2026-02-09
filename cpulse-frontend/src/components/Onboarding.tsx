import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PLATFORMS = [
  {
    id: "leetcode" as const,
    name: "LeetCode",
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
      </svg>
    ),
    placeholder: "e.g. tourist",
  },
  {
    id: "codeforces" as const,
    name: "Codeforces",
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" />
      </svg>
    ),
    placeholder: "e.g. tourist",
  },
  {
    id: "codechef" as const,
    name: "CodeChef",
    color: "from-yellow-600 to-amber-700",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-400",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M11.257.004c-.207.008-.404.045-.588.116-.614.236-.96.7-1.073 1.341-.093.512-.049 1.027-.025 1.54.001.038.028.093-.035.1-.04.003-.052-.045-.068-.076-.148-.298-.163-.628-.227-.944-.088-.423-.163-.85-.31-1.26-.147-.407-.402-.668-.85-.716-.454-.048-.798.135-1.022.526-.2.35-.23.737-.222 1.13.016.703.142 1.39.355 2.055.067.213.16.418.196.643-.063-.014-.078-.068-.104-.107-.326-.482-.617-.992-.988-1.444-.258-.315-.555-.595-.97-.697-.515-.127-.976.085-1.148.575-.103.294-.077.6-.023.9.15.83.526 1.56 1.026 2.228.144.194.303.378.43.584.04.067.13.14.072.218-.058.078-.153.037-.233.023-.453-.08-.87-.26-1.27-.474-.493-.264-1.003-.488-1.555-.588-.465-.084-.845.047-1.08.47-.228.416-.096.806.132 1.166.59.936 1.416 1.597 2.41 2.07.19.09.387.168.556.298-.03.036-.072.02-.107.024-.577.054-1.127.196-1.62.508-.336.213-.568.477-.498.903.072.44.357.687.773.796.67.173 1.323.082 1.96-.115.627-.192 1.211-.498 1.8-.793.103-.052.2-.118.31-.15.01.057-.037.076-.06.106-.424.54-.838 1.09-1.137 1.717-.158.33-.277.673-.272 1.053.005.39.2.667.575.79.402.133.74-.01 1.016-.305.555-.594.887-1.325 1.17-2.08.055-.15.105-.3.163-.465.043.076.04.14.055.197.15.595.367 1.163.736 1.668.18.248.39.468.682.59.453.19.843.06 1.073-.374.165-.31.178-.65.13-.99-.118-.852-.49-1.595-.968-2.29-.06-.088-.137-.165-.178-.273.035-.02.055.007.076.017.744.38 1.492.74 2.322.87.32.05.64.07.95-.04.442-.158.67-.525.6-.99-.054-.37-.275-.614-.567-.798-.582-.368-1.238-.518-1.913-.594-.076-.01-.16 0-.218-.067.072-.06.157-.072.238-.1.723-.272 1.383-.66 1.916-1.235.267-.287.487-.606.537-1.01.06-.49-.178-.836-.645-.96-.348-.094-.678-.013-.996.115-.653.262-1.21.683-1.764 1.108-.066.05-.125.113-.203.143-.034-.047-.002-.086.01-.124.16-.542.286-1.09.367-1.65.064-.44.098-.882.02-1.325-.065-.37-.192-.71-.506-.94-.406-.297-.903-.252-1.254.12-.443.47-.629 1.075-.765 1.7-.065.298-.103.603-.162.937-.075-.132-.088-.253-.12-.367-.193-.707-.44-1.394-.876-2.002-.2-.277-.432-.527-.77-.636a.89.89 0 0 0-.267-.045zm3.735 14.093c-.022.005-.04.015-.058.028-.146.11-.15.383-.005.5.343.275.7.53 1.068.77.114.073.144.15.1.28-.16.476-.304.957-.458 1.435-.046.14-.003.203.127.262.395.18.78.38 1.17.566.106.05.125.116.085.22-.2.525-.39 1.053-.582 1.58-.047.128-.01.197.113.255.39.184.777.374 1.166.562.1.048.13.106.1.21-.168.55-.322 1.104-.48 1.657-.047.162.01.232.17.233h1.303c.122 0 .182-.05.213-.17.158-.604.323-1.206.487-1.808.026-.093.076-.133.175-.133.417.002.833.002 1.25 0 .098 0 .147.04.173.133.163.6.33 1.2.487 1.803.03.123.09.175.215.174.43-.004.858-.003 1.287 0 .162.001.21-.077.164-.232-.16-.55-.314-1.104-.482-1.653-.035-.115-.004-.175.102-.224.385-.183.767-.37 1.15-.556.13-.063.17-.132.12-.27-.19-.52-.37-1.045-.567-1.563-.046-.12-.02-.183.094-.24.386-.187.768-.383 1.152-.574.133-.066.164-.148.114-.283-.152-.41-.296-.825-.434-1.24-.084-.254-.077-.254-.082-.262-.01-.015.058-.088-.102-.167-.12-.06-.235-.13-.353-.194l-.81-.447c-.085-.047-.144-.04-.213.04-.482.556-1.097.894-1.84 1.002-.96.14-1.806-.12-2.508-.788-.04-.038-.083-.074-.11-.123.06-.045.113-.01.162.01.35.135.712.215 1.087.215.932 0 1.68-.413 2.174-1.21.022-.037.05-.072.044-.126h-5.66z" />
      </svg>
    ),
    placeholder: "e.g. admin",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !handle.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/auth/profiles", {
        platform: selectedPlatform,
        handle: handle.trim(),
      });

      setSuccess(`Successfully linked your ${selectedPlatform} profile!`);
      await refreshUser();

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to link profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await api.post("/api/auth/onboarding/complete");
      await refreshUser();
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const selected = PLATFORMS.find((p) => p.id === selectedPlatform);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Step 1 of 1
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Link Your CP Profile</h1>
          <p className="text-gray-400 text-lg">
            Connect at least one competitive programming profile to get started.
            {user?.displayName && <span className="text-white font-medium"> Welcome, {user.displayName}!</span>}
          </p>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => {
                setSelectedPlatform(platform.id);
                setError("");
                setSuccess("");
              }}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-center group ${
                selectedPlatform === platform.id
                  ? `${platform.borderColor} ${platform.bgColor} scale-105 shadow-lg`
                  : "border-white/10 bg-gray-800/30 hover:border-white/20 hover:bg-gray-800/50"
              }`}
            >
              <div className={`inline-flex items-center justify-center mb-3 ${
                selectedPlatform === platform.id ? platform.textColor : "text-gray-400 group-hover:text-gray-300"
              }`}>
                {platform.icon}
              </div>
              <p className={`font-semibold ${
                selectedPlatform === platform.id ? "text-white" : "text-gray-300"
              }`}>
                {platform.name}
              </p>
              {selectedPlatform === platform.id && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Handle Input */}
        {selectedPlatform && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl mb-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleAddProfile}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your {selected?.name} Username
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder={selected?.placeholder}
                  required
                  className={`flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border border-white/10 text-white placeholder-gray-500 focus:ring-2 outline-none transition-all ${
                    selected ? `focus:border-transparent focus:ring-${selected.textColor.replace('text-', '')}/30` : ''
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading || !handle.trim()}
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r ${selected?.color} text-white font-semibold transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  ) : "Link Profile"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll verify this username exists on {selected?.name} before linking it.
              </p>
            </form>
          </div>
        )}

        {/* Skip */}
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
          >
            Skip for now, I'll add profiles later
          </button>
        </div>
      </div>
    </div>
  );
}
