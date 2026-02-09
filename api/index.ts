import { VercelRequest, VercelResponse } from "@vercel/node";

// Import the Express app
import app from "../src/index";

// Vercel serverless handler
export default function handler(req: VercelRequest, res: VercelResponse) {
    // Let Express handle the request
    return app(req, res);
}
