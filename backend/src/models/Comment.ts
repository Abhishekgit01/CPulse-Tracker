import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  content: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, maxlength: 5000 },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "AuthUser" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "AuthUser" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
