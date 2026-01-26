import { Company } from "../models/Company";
import { CompanyProblem } from "../models/CompanyProblem";
import { popularCompanies } from "../data/seedCompanies";

export const seedDatabase = async () => {
    try {
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
