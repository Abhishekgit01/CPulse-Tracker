import { Router } from "express";
import axios from "axios";

const router = Router();

router.post("/chat", async (req, res) => {
    try {
        const { message, context } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
        }

        // Construct the system prompt with user context
        const systemPrompt = `You are "CPulse Coach", an expert Competitive Programming Coach.
    Your goal is to help users improve their rating, suggest practice strategies, and provide moral support.
    
    User Context:
    - Handle: ${context?.handle || "Unknown"}
    - Platform: ${context?.platform || "Unknown"}
    - Current Rating: ${context?.rating || "N/A"}
    - Max Rating: ${context?.maxRating || "N/A"}
    
    Keep your answers concise, encouraging, and technical when needed. Use markdown for code.`;

        // Call Gemini API (REST)
        // Call Gemini API (REST)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await axios.post(url, {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser: ${message}`
                }]
            }]
        });

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            throw new Error("Empty response from Gemini");
        }

        res.json({ reply });

    } catch (err: any) {
        const details = err.response?.data?.error?.message || err.message;
        console.error("AI CHAT ERROR:", details);
        res.status(500).json({ error: "Failed to get AI response", details });
    }
});

export default router;
