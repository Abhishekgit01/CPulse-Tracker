import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  location: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  totalPosts: number;
  totalComments: number;
  reputation: number;
  points: number;
  theme: string;
  borderStyle: string;
  badgeShowcase: string[];
  avatarFrame: string;
  bannerColor: string;
  unlockedThemes: string[];
  unlockedBorders: string[];
  unlockedFrames: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true, unique: true },
    bio: { type: String, default: "", maxlength: 500 },
    location: { type: String, default: "" },
    skills: [{ type: String, trim: true }],
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    theme: { type: String, default: "default" },
    borderStyle: { type: String, default: "none" },
    badgeShowcase: [{ type: String }],
    avatarFrame: { type: String, default: "none" },
    bannerColor: { type: String, default: "#4f46e5" },
    unlockedThemes: { type: [String], default: ["default"] },
    unlockedBorders: { type: [String], default: ["none"] },
    unlockedFrames: { type: [String], default: ["none"] },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
