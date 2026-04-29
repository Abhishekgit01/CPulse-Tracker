import mongoose from "mongoose";
import { seedDatabase } from "../services/seeder";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cpulse";

// Global cached connection for serverless
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if no connection
      serverSelectionTimeoutMS: 10000, // Fail after 10 seconds instead of 30
      connectTimeoutMS: 10000,
    };

    console.log("Connecting to MongoDB...", MONGO_URI ? "(URI provided)" : "(NO URI!)");
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      // Seed data only on new connection (background, don't block)
      seedDatabase().catch((err) => console.error("Seed error:", err));
      return mongoose;
    }).catch((err) => {
      console.error("MongoDB connection FAILED:", err.message);
      console.error("Check: 1) MONGO_URI env var 2) Atlas Network Access (whitelist 0.0.0.0/0) 3) Username/password");
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}
