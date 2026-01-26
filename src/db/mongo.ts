import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cpulse";

export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("WARNING: MONGO_URI not found in .env, using local fallback.");
    }
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
}
