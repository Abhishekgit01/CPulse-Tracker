import { Company } from "../models/Company";
import { CompanyProblem } from "../models/CompanyProblem";
import { College } from "../models/College";
import { AuthUser } from "../models/AuthUser";
import { popularCompanies } from "../data/seedCompanies";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ===================== DEFAULT COLLEGES ===================== */
const DEFAULT_COLLEGES = [
  { name: "Indian Institute of Technology, Bombay", code: "IITB" },
  { name: "Indian Institute of Technology, Delhi", code: "IITD" },
  { name: "Indian Institute of Technology, Madras", code: "IITM" },
  { name: "Indian Institute of Technology, Kanpur", code: "IITK" },
  { name: "Indian Institute of Technology, Kharagpur", code: "IITKGP" },
  { name: "BITS Pilani", code: "BITSP" },
  { name: "National Institute of Technology, Trichy", code: "NITT" },
  { name: "Delhi Technological University", code: "DTU" },
  { name: "IIIT Hyderabad", code: "IIITH" },
  { name: "VIT Vellore", code: "VIT" },
  { name: "SRM Institute of Science and Technology", code: "SRM" },
  { name: "PES University", code: "PESU" },
  { name: "RV College of Engineering", code: "RVCE" },
  { name: "BMS College of Engineering", code: "BMSCE" },
  { name: "Manipal Institute of Technology", code: "MIT" },
  { name: "JAIN University", code: "JAIN" },
  { name: "Christ University", code: "CHRIST" },
  { name: "Amrita Vishwa Vidyapeetham", code: "AMRITA" },
  { name: "KIIT University", code: "KIIT" },
  { name: "Lovely Professional University", code: "LPU" },
];

/* Create a system admin ObjectId for seeded colleges */
const SYSTEM_ADMIN_ID = new mongoose.Types.ObjectId("000000000000000000000001");

export async function seedColleges(): Promise<void> {
  try {
    const existingCount = await College.countDocuments();
    if (existingCount > 0) {
      console.log(`Colleges already seeded (${existingCount} found). Skipping.`);
      return;
    }

    let created = 0;
    for (const col of DEFAULT_COLLEGES) {
      const exists = await College.findOne({ code: col.code });
      if (!exists) {
        await College.create({
          name: col.name,
          code: col.code,
          description: `${col.name} - Competitive Programming Hub`,
          createdBy: SYSTEM_ADMIN_ID,
        });
        created++;
      }
    }
    console.log(`Seeded ${created} default colleges.`);
  } catch (err: any) {
    console.error("COLLEGE SEED ERROR:", err.message);
  }
}

/* ===================== SEED ADMIN USER ===================== */
export async function seedAdmin(): Promise<void> {
  try {
    const existing = await AuthUser.findOne({ email: "admin@cpulse.com" });
    if (existing) {
      // Ensure role is admin
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log("Admin role updated.");
      }
      return;
    }

    const hashed = await bcrypt.hash("admin123", 10);
    await AuthUser.create({
      email: "admin@cpulse.com",
      password: hashed,
      displayName: "CPulse Admin",
      role: "admin",
      onboarded: true,
    });
    console.log("Admin user created: admin@cpulse.com / admin123");
  } catch (err: any) {
    console.error("ADMIN SEED ERROR:", err.message);
  }
}

/**
 * Auto-create college from a CP profile institution name if it doesn't exist.
 * Returns the college ID if found/created, null otherwise.
 */
export async function findOrCreateCollegeFromInstitution(institution: string): Promise<string | null> {
  if (!institution || institution.trim().length < 3) return null;

  const normalized = institution.trim();
  const code = normalized
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("")
    .substring(0, 10)
    .toUpperCase();

  if (!code || code.length < 2) return null;

  // Try exact code match first
  let college = await College.findOne({ code });
  if (college) return college._id.toString();

  // Try name match (case-insensitive)
  college = await College.findOne({ name: { $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
  if (college) return college._id.toString();

  // Create new college
  try {
    college = await College.create({
      name: normalized,
      code,
      description: `Auto-created from CP profile institution`,
      createdBy: SYSTEM_ADMIN_ID,
    });
    console.log(`Auto-created college: ${normalized} (${code})`);
    return college._id.toString();
  } catch (err: any) {
    // Duplicate key - another request created it
    if (err.code === 11000) {
      college = await College.findOne({ code });
      return college?._id.toString() || null;
    }
    console.error("Auto-create college error:", err.message);
    return null;
  }
}

export const seedDatabase = async () => {
  try {
    console.log("Seeding database...");

    // Seed colleges first
    await seedColleges();

    // Seed admin user
    await seedAdmin();

    console.log("Seeding companies database...");
    let createdCount = 0;

    for (const companyData of popularCompanies) {
      // 1. Create Company
      const slug = companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      let company = await Company.findOne({ slug });

      if (!company) {
        company = new Company({
          name: companyData.name,
          slug,
          logo: companyData.logo,
          description: `Top interview questions asked by ${companyData.name}`,
        });
        await company.save();
        createdCount++;
      } else {
        // Update logo if missing or changed
        if (companyData.logo && company.logo !== companyData.logo) {
          company.logo = companyData.logo;
          await company.save();
        }
      }

      // 2. Add Problems
      for (const item of companyData.items) {
        const exists = await CompanyProblem.findOne({
          companyId: company._id,
          problemUrl: item.url,
        });

        if (!exists) {
          await CompanyProblem.create({
            companyId: company._id,
            problemTitle: item.title,
            problemUrl: item.url,
            platform: item.url.includes("leetcode") ? "leetcode" :
              item.url.includes("codeforces") ? "codeforces" : "codechef",
            difficulty: item.difficulty,
            tags: item.tags,
            dateAsked: new Date(),
            notes: "Popular interview question",
          });
        }
      }
    }

    console.log(`Database seeded successfully with ${createdCount} new companies!`);
  } catch (error: any) {
    console.error("SEED ERROR:", error.message);
  }
};
