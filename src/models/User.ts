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
  platform: "codeforces" | "leetcode" | "codechef";

  /* ---------- Codeforces ---------- */
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;

  /* ---------- LeetCode ---------- */
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;

  /* ---------- CodeChef ---------- */
  stars?: number;
  globalRank?: number;
  countryRank?: number;
  problemsSolved?: number;

  /* ---------- CPulse ---------- */
  cpulseRating: number;

  /* ---------- Rich Profile Info (Maximization) ---------- */
    avatar?: string;
    title?: string;
    contribution?: number;
    friendOfCount?: number;
    organization?: string;
    lastOnlineTimeSeconds?: number;
    contestRating?: number;
    globalRanking?: number;
    topPercentage?: number;
    reputation?: number;
    division?: string;
    country?: string;

    /* ---------- Enhanced Fields ---------- */
    contestsAttended?: number;
    streak?: number;
    totalActiveDays?: number;
    badges?: { name: string; icon?: string }[];
    languages?: { name: string; problemsSolved: number }[];
    topTags?: { tag: string; count: number }[];
    recentSubmissions?: { title: string; status: string; language: string; timestamp: string; tags?: string[]; rating?: number }[];
    registrationTimeSeconds?: number;
    city?: string;

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
      enum: ["codeforces", "leetcode", "codechef"],
    },

    /* ---------- Codeforces fields ---------- */
    rating: { type: Number },
    maxRating: { type: Number },
    rank: { type: String },
    maxRank: { type: String },

    /* ---------- LeetCode fields ---------- */
    totalSolved: { type: Number },
    easySolved: { type: Number },
    mediumSolved: { type: Number },
    hardSolved: { type: Number },

    /* ---------- CodeChef fields ---------- */
    stars: { type: Number },
    globalRank: { type: Number },
    countryRank: { type: Number },
    problemsSolved: { type: Number },

    /* ---------- CPulse Rating ---------- */
    cpulseRating: {
      type: Number,
      default: 0,
    },

    /* ---------- Rich Profile Info ---------- */
    avatar: { type: String },
    title: { type: String },
    contribution: { type: Number },
    friendOfCount: { type: Number },
    organization: { type: String },
    lastOnlineTimeSeconds: { type: Number },
    contestRating: { type: Number },
    globalRanking: { type: Number },
    topPercentage: { type: Number },
    reputation: { type: Number },
    division: { type: String },
    country: { type: String },

    /* ---------- Enhanced Fields ---------- */
    contestsAttended: { type: Number },
    streak: { type: Number },
    totalActiveDays: { type: Number },
    badges: [{ name: { type: String }, icon: { type: String } }],
    languages: [{ name: { type: String }, problemsSolved: { type: Number } }],
    topTags: [{ tag: { type: String }, count: { type: Number } }],
    recentSubmissions: [{
      title: { type: String },
      status: { type: String },
      language: { type: String },
      timestamp: { type: String },
      tags: [{ type: String }],
      rating: { type: Number },
    }],
    registrationTimeSeconds: { type: Number },
    city: { type: String },

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
