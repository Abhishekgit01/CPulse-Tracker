import { Router } from "express";
import { Company } from "../models/Company";
import { CompanyProblem } from "../models/CompanyProblem";
import { popularCompanies } from "../data/seedCompanies";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const companies = await Company.find().sort({ name: 1 });

        const companiesWithCounts = await Promise.all(
            companies.map(async (company) => {
                const problemCount = await CompanyProblem.countDocuments({
                    companyId: company._id,
                });

                return {
                    _id: company._id,
                    name: company.name,
                    slug: company.slug,
                    logo: company.logo,
                    description: company.description,
                    problemCount,
                };
            })
        );

        res.json(companiesWithCounts);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch companies" });
    }
});

router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        const company = await Company.findOne({ slug });

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        const problems = await CompanyProblem.find({ companyId: company._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            company: {
                _id: company._id,
                name: company.name,
                slug: company.slug,
                logo: company.logo,
                description: company.description,
            },
            problems,
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch company" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, logo, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Company name is required" });
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const existing = await Company.findOne({ slug });
        if (existing) {
            return res.status(400).json({ error: "Company already exists" });
        }

        const company = new Company({
            name,
            slug,
            logo,
            description,
        });

        await company.save();

        res.status(201).json({
            message: "Company created successfully",
            company,
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to create company" });
    }
});

router.post("/:slug/problems", async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            problemTitle,
            problemUrl,
            platform,
            difficulty,
            tags,
            notes,
            dateAsked,
            addedBy,
        } = req.body;

        if (!problemTitle || !problemUrl || !platform || !difficulty) {
            return res.status(400).json({
                error: "Problem title, URL, platform, and difficulty are required",
            });
        }

        const company = await Company.findOne({ slug });
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        const problem = new CompanyProblem({
            companyId: company._id,
            problemTitle,
            problemUrl,
            platform,
            difficulty,
            tags: tags || [],
            notes,
            dateAsked,
            addedBy,
        });

        await problem.save();

        res.status(201).json({
            message: "Problem added successfully",
            problem,
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to add problem" });
    }
});

router.delete("/:slug/problems/:problemId", async (req, res) => {
    try {
        const { slug, problemId } = req.params;

        const company = await Company.findOne({ slug });
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        const result = await CompanyProblem.findByIdAndDelete(problemId);

        if (!result) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.json({
            message: "Problem deleted successfully",
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to delete problem" });
    }
});

router.post("/seed", async (_req, res) => {
    try {
        let createdCount = 0;

        for (const companyData of popularCompanies) {
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
            }

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
                        platform: "leetcode",
                        difficulty: item.difficulty,
                        tags: item.tags,
                        dateAsked: new Date(),
                        notes: "Popular interview question",
                    });
                }
            }
        }

        res.json({
            message: `Database seeded successfully with ${createdCount} new companies`,
            totalCompanies: popularCompanies.length,
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to seed database" });
    }
});

export default router;
