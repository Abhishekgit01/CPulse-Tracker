import mongoose, { Schema, Document } from "mongoose";

export interface ICPProfile {
  platform: "leetcode" | "codeforces" | "codechef";
  handle: string;
  verified: boolean;
  addedAt: Date;
}

export interface IAuthUser extends Document {
  email: string;
  password: string;
  displayName?: string;
  cpProfiles: ICPProfile[];
  onboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CPProfileSchema = new Schema<ICPProfile>(
  {
    platform: {
      type: String,
      required: true,
      enum: ["leetcode", "codeforces", "codechef"],
    },
    handle: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AuthUserSchema = new Schema<IAuthUser>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    displayName: { type: String, trim: true },
    cpProfiles: { type: [CPProfileSchema], default: [] },
    onboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AuthUser = mongoose.model<IAuthUser>("AuthUser", AuthUserSchema);
