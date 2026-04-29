import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  res.send("CPulse backend is running 🚀");
});

router.get("/api/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  let connectionError: string | null = null;
  let connectionTest = "not attempted";

  if (dbState === 0) {
    try {
      const uri = process.env.MONGO_URI;

      if (uri) {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        connectionTest = "success";
      } else {
        connectionTest = "no uri";
      }
    } catch (error: any) {
      connectionError = error.message;
      connectionTest = "failed";
    }
  }

  const currentState = mongoose.connection.readyState;

  res.json({
    status: "ok",
    database: states[currentState] || "unknown",
    previousState: states[dbState],
    connectionTest,
    connectionError,
    timestamp: new Date().toISOString(),
    mongoUri: process.env.MONGO_URI
      ? `configured (${process.env.MONGO_URI.substring(0, 30)}...)`
      : "MISSING!",
  });
});

export default router;
