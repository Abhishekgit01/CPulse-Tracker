import { RequestHandler } from "express";
import { connectDB } from "../db/mongo";

export const ensureDatabaseConnection: RequestHandler = async (
  _req,
  _res,
  next
) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed in middleware:", error);
  }

  next();
};
