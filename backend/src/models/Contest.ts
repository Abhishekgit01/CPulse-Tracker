import { Schema, model } from "mongoose";

interface IContest {
    name: string;
    platform: "codeforces" | "codechef" | "leetcode" | "atcoder";
    startTime: Date;
    duration: number; // in seconds
    url: string;
    phase?: "BEFORE" | "CODING" | "FINISHED" | "PENDING_SYSTEM_TEST";
    type?: string;
    participants?: number;
    externalId?: string; // Platform-specific contest ID
}

const contestSchema = new Schema<IContest>(
    {
        name: { type: String, required: true },
        platform: {
            type: String,
            required: true,
            enum: ["codeforces", "codechef", "leetcode", "atcoder"],
        },
        startTime: { type: Date, required: true },
        duration: { type: Number, required: true },
        url: { type: String, required: true },
        phase: {
            type: String,
            enum: ["BEFORE", "CODING", "FINISHED", "PENDING_SYSTEM_TEST"],
        },
        type: { type: String },
        participants: { type: Number },
        externalId: { type: String },
    },
    { timestamps: true }
);

// Index for efficient querying
contestSchema.index({ platform: 1, startTime: 1 });
contestSchema.index({ startTime: 1 });

export const Contest = model<IContest>("Contest", contestSchema);
