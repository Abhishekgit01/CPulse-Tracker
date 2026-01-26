import mongoose, { Schema, Document } from "mongoose";

/**
 * CompanyProblem document interface
 * Maps problems to companies
 */
export interface ICompanyProblem extends Document {
    companyId: mongoose.Types.ObjectId;
    problemTitle: string;
    problemUrl: string;
    platform: "codeforces" | "leetcode" | "codechef";
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    notes?: string;
    dateAsked?: Date;
    addedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CompanyProblemSchema = new Schema<ICompanyProblem>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        problemTitle: {
            type: String,
            required: true,
            trim: true,
        },
        problemUrl: {
            type: String,
            required: true,
            trim: true,
        },
        platform: {
            type: String,
            required: true,
            enum: ["codeforces", "leetcode", "codechef"],
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"],
        },
        tags: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            trim: true,
        },
        dateAsked: {
            type: Date,
        },
        addedBy: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for company queries
CompanyProblemSchema.index({ companyId: 1, createdAt: -1 });

export const CompanyProblem = mongoose.model<ICompanyProblem>(
    "CompanyProblem",
    CompanyProblemSchema
);
