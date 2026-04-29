import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  name: string;
  code: string;
  collegeId: mongoose.Types.ObjectId;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    description: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "AuthUser" }],
  },
  { timestamps: true }
);

CourseSchema.index({ collegeId: 1, code: 1 }, { unique: true });

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
