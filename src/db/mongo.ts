import mongoose from "mongoose";
import { seedDatabase } from "../services/seeder";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cpulse";

export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("WARNING: MONGO_URI not found in .env, using local fallback.");
    }
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // Seed default data (colleges, companies) on startup
    seedDatabase().catch((err) => console.error("Seed error:", err));
  } catch (error) {
    console.error("MongoDB connection failed", error);
    // Don't exit — let routes that don't need MongoDB still work
  }
}
