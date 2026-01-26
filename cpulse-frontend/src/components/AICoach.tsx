import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "ai";
    text: string;
}

export default function AICoach() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", text: "Hi! I'm your CP Coach. Ask me anything about competitive programming! 🚀" }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            // Send context (placeholder for now, can be expanded to pull from props/store)
            const context = {
                handle: "User", // TODO: Get from AuthContext
                platform: "Codeforces",
                rating: 1500, // TODO: Fetch real stats
            };

            const res = await axios.post("http://localhost:5000/api/ai/chat", {
                message: userMsg,
                context
            });

            setMessages((prev) => [...prev, { role: "ai", text: res.data.reply }]);
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.details || "Sorry, I encountered an error. Please try again.";
            setMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${errMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* FLOATING BUTTON */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 z-50 flex items-center gap-2"
                >
                    <Bot size={28} />
                    <span className="font-bold hidden md:inline">Ask Coach</span>
                </button>
            )}

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* HEADER */}
                    <div className="p-4 bg-indigo-600 text-white rounded-t-2xl flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <div>
                                <h3 className="font-bold text-lg">CP Coach</h3>
                                <p className="text-xs text-indigo-200">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-indigo-500 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* MESSAGES */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 scroll-smooth"
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                    ${msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-green-100 text-green-600"}`}
                                >
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-gray-700 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600"
                                        }`}
                                >
                                    {/* Render newlines properly */}
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-600 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-gray-400" />
                                    <span className="text-xs text-gray-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* INPUT AREA */}
                    <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about DP, Graphs, or your rating..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-md"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>

                </div>
            )}
        </>
    );
}
