import mongoose, { Schema, Document } from "mongoose";

export interface IReward extends Document {
  userId: mongoose.Types.ObjectId;
  type: "badge" | "theme" | "border" | "frame" | "points";
  name: string;
  description: string;
  icon?: string;
  points?: number;
  earnedAt: Date;
  source: string;
}

const RewardSchema = new Schema<IReward>({
  userId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true, index: true },
  type: { type: String, enum: ["badge", "theme", "border", "frame", "points"], required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  icon: { type: String },
  points: { type: Number },
  earnedAt: { type: Date, default: Date.now },
  source: { type: String, required: true },
});

export const Reward = mongoose.model<IReward>("Reward", RewardSchema);
