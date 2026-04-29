import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  type: "discussion" | "recruitment";
  title: string;
  content: string;
  hackathonId?: string;
  hackathonName?: string;
  teamSize?: number;
  rolesNeeded?: string[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  commentCount: number;
  viewCount: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true, index: true },
    type: { type: String, enum: ["discussion", "recruitment"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 10000 },
    hackathonId: { type: String },
    hackathonName: { type: String },
    teamSize: { type: Number, min: 1, max: 20 },
    rolesNeeded: [{ type: String, trim: true }],
    upvotes: [{ type: Schema.Types.ObjectId, ref: "AuthUser" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "AuthUser" }],
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ type: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>("Post", PostSchema);
