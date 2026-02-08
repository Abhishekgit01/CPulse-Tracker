import { Router } from "express";
import axios from "axios";

const router = Router();

async function geminiWithRetry(url: string, body: any, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await axios.post(url, body, { timeout: 30000 });
    } catch (err: any) {
      if (err.response?.status === 429 && attempt < maxRetries - 1) {
        const delay = (attempt + 1) * 3000;
        console.log(`[AI Chat] Gemini 429, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await geminiWithRetry(url, {
            contents: [{
                role: "user",
                parts: [{
                    text: `${systemPrompt}\n\nUser: ${message}`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            throw new Error("Invalid response received from the generation service.");
        }

        res.json({ reply });

    } catch (err: any) {
        const errorDetails = err.response?.data?.error || err.message;

        console.error("[Service Error] AI Chat Integration Failure:", {
            statusCode: err.response?.status,
            message: errorDetails,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            error: "An error occurred while processing your request with the AI service.",
            details: process.env.NODE_ENV === "development" ? errorDetails : undefined
        });
    }
});

export default router;
