import mongoose, { Schema, Document } from "mongoose";

/* ===================== TYPES ===================== */

export interface GrowthPoint {
  date: string;   // YYYY-MM-DD
  score: number;  // rating / solved count
}

export interface IUser extends Document {
  handle: string;
  platform: "codeforces" | "leetcode";

  // Codeforces-specific
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;

  // LeetCode-specific
  totalSolved?: number;

  // Growth (used by frontend charts)
  history: GrowthPoint[];

  classId?: string;
}

/* ===================== SCHEMA ===================== */

const UserSchema = new Schema<IUser>(
  {
    handle: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      required: true,
      enum: ["codeforces", "leetcode"],
    },

    /* ---------- Codeforces fields ---------- */
    rating: { type: Number },
    maxRating: { type: Number },
    rank: { type: String },
    maxRank: { type: String },

    /* ---------- LeetCode fields ---------- */
    totalSolved: { type: Number },

    /* ---------- Growth history ---------- */
    history: [
      {
        date: { type: String, required: true },
        score: { type: Number, required: true },
      },
    ],

    /* ---------- Optional grouping ---------- */
    classId: {
      type: String,
      default: "general",
    },
  },
  {
    timestamps: true,
  }
);

/* ===================== INDEXES ===================== */

/**
 * IMPORTANT:
 * Same handle can exist on different platforms.
 * tourist@codeforces ≠ tourist@leetcode
 */
UserSchema.index({ handle: 1, platform: 1 }, { unique: true });

/* ===================== MODEL ===================== */

export const User = mongoose.model<IUser>("User", UserSchema);
