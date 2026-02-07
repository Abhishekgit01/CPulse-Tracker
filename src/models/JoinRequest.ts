import mongoose, { Schema, Document } from "mongoose";

export interface IJoinRequest extends Document {
  userId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  message?: string;
}

const JoinRequestSchema = new Schema<IJoinRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "AuthUser" },
    message: { type: String, trim: true },
  },
  { timestamps: true }
);

JoinRequestSchema.index({ userId: 1, courseId: 1, status: 1 });

export const JoinRequest = mongoose.model<IJoinRequest>("JoinRequest", JoinRequestSchema);
