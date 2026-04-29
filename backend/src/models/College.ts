import mongoose, { Schema, Document } from "mongoose";

export interface ICollege extends Document {
  name: string;
  code: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  managers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CollegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true },
    managers: [{ type: Schema.Types.ObjectId, ref: "AuthUser" }],
  },
  { timestamps: true }
);

export const College = mongoose.model<ICollege>("College", CollegeSchema);
