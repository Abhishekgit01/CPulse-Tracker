import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    handle: { type: String, required: true, unique: true },
    platform: { type: String, default: "codeforces" }, // can be "codeforces" or "leetcode"
    rating: { type: Number, default: 0 }, // for Codeforces
    maxRating: { type: Number, default: 0 }, // for Codeforces
    rank: { type: String, default: "unrated" }, // for Codeforces
    maxRank: { type: String, default: "unrated" }, // for Codeforces
    totalSolved: { type: Number, default: 0 }, // for LeetCode
    classId: { type: String, default: "general" }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
