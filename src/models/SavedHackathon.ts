import mongoose, { Schema, Document } from "mongoose";

export interface ISavedHackathon extends Document {
  userId: mongoose.Types.ObjectId;
  hackathonId: string;
  source: "devfolio" | "mlh" | "devpost";
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  location: string;
  createdAt: Date;
}

const SavedHackathonSchema = new Schema<ISavedHackathon>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true, index: true },
    hackathonId: { type: String, required: true },
    source: { type: String, enum: ["devfolio", "mlh", "devpost"], required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

SavedHackathonSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

export const SavedHackathon = mongoose.model<ISavedHackathon>("SavedHackathon", SavedHackathonSchema);
