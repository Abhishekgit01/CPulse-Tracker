import mongoose, { Schema, Document } from "mongoose";

export interface ISavedContest extends Document {
  userId: mongoose.Types.ObjectId;
  contestId: string;
  platform: "codeforces" | "codechef" | "leetcode" | "atcoder";
  name: string;
  startTime: Date;
  duration: number;
  url: string;
  participated: boolean;
  createdAt: Date;
}

const SavedContestSchema = new Schema<ISavedContest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true },
    contestId: { type: String, required: true },
    platform: {
      type: String,
      enum: ["codeforces", "codechef", "leetcode", "atcoder"],
      required: true,
    },
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    url: { type: String, required: true },
    participated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SavedContestSchema.index({ userId: 1, contestId: 1 }, { unique: true });
SavedContestSchema.index({ userId: 1, startTime: -1 });

export const SavedContest = mongoose.model<ISavedContest>("SavedContest", SavedContestSchema);
