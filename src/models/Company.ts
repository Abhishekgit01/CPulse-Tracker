import mongoose, { Schema, Document } from "mongoose";

/**
 * Company document interface
 */
export interface ICompany extends Document {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        logo: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Company = mongoose.model<ICompany>("Company", CompanySchema);
