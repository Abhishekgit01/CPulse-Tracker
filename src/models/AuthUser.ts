import mongoose, { Schema, Document } from "mongoose";

export interface IAuthUser extends Document {
  email: string;
  password: string;
}

const AuthUserSchema = new Schema<IAuthUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const AuthUser = mongoose.model<IAuthUser>(
  "AuthUser",
  AuthUserSchema
);
