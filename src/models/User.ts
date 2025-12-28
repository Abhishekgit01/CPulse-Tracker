import mongoose, { Schema, Document } from "mongoose";

/* ===================== TYPES ===================== */

/**
 * A single point used for growth charts
 */
export interface GrowthPoint {
  date: string;   // YYYY-MM-DD
  score: number;  // rating / solved count / cpulse score
}

/**
 * User document interface
 */
export interface IUser extends Document {
  handle: string;
  platform: "codeforces" | "leetcode";

  /* ---------- Codeforces ---------- */
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;

  /* ---------- LeetCode ---------- */
  totalSolved?: number;

  /* ---------- CPulse ---------- */
  cpulseRating: number;

  /* ---------- Growth ---------- */
  history: GrowthPoint[];

  /* ---------- Grouping ---------- */
  classId?: string;

  createdAt: Date;
  updatedAt: Date;
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

    /* ---------- CPulse Rating ---------- */
    cpulseRating: {
      type: Number,
      default: 0,
    },

    /* ---------- Growth History ---------- */
    history: [
      {
        date: { type: String, required: true },
        score: { type: Number, required: true },
      },
    ],

    /* ---------- Class / Group ---------- */
    classId: {
      type: String,
      default: "general",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ===================== INDEXES ===================== */

/**
 * Same handle can exist on different platforms
 * tourist@codeforces ≠ tourist@leetcode
 */
UserSchema.index({ handle: 1, platform: 1 }, { unique: true });

/* ===================== MIDDLEWARE ===================== */

/**
 * Automatically recalculate CPulse Rating
 * whenever user data changes
 *

/* ===================== MODEL ===================== */

export const User = mongoose.model<IUser>("User", UserSchema);
