import { Router } from "express";
import { College } from "../models/College";
import { Course } from "../models/Course";
import { AuthUser } from "../models/AuthUser";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/roles";

const router = Router();

/* -------- LIST ALL COLLEGES -------- */
router.get("/", async (_req, res) => {
  try {
    const colleges = await College.find().select("-__v").sort({ name: 1 });
    const result = await Promise.all(
      colleges.map(async (c) => {
        const courseCount = await Course.countDocuments({ collegeId: c._id });
        const memberCount = await AuthUser.countDocuments({ collegeId: c._id });
        return { ...c.toObject(), courseCount, memberCount };
      })
    );
    res.json({ colleges: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

/* -------- GET COLLEGE DETAILS -------- */
router.get("/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id)
      .populate("managers", "displayName email")
      .select("-__v");
    if (!college) return res.status(404).json({ error: "College not found" });

    const courses = await Course.find({ collegeId: college._id }).select("name code description members");
    const memberCount = await AuthUser.countDocuments({ collegeId: college._id });

    res.json({
      college: {
        ...college.toObject(),
        courses: courses.map((c) => ({
          _id: c._id,
          name: c.name,
          code: c.code,
          description: c.description,
          memberCount: c.members.length,
        })),
        memberCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch college" });
  }
});

/* -------- CREATE COLLEGE (Admin) -------- */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) return res.status(400).json({ error: "Name and code are required" });

    const existing = await College.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(409).json({ error: "A college with this code already exists" });

    const college = await College.create({
      name,
      code: code.toUpperCase(),
      description,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({ college });
  } catch (err) {
    res.status(500).json({ error: "Failed to create college" });
  }
});

/* -------- UPDATE COLLEGE (Admin) -------- */
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(description !== undefined && { description }) },
      { new: true }
    );
    if (!college) return res.status(404).json({ error: "College not found" });
    res.json({ college });
  } catch (err) {
    res.status(500).json({ error: "Failed to update college" });
  }
});

/* -------- DELETE COLLEGE (Admin) -------- */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: "College not found" });

    // Remove college & course references from users
    await AuthUser.updateMany({ collegeId: college._id }, { $set: { collegeId: null, courseId: null } });
    await Course.deleteMany({ collegeId: college._id });
    await college.deleteOne();

    res.json({ message: "College deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete college" });
  }
});

/* -------- ADD MANAGER (Admin) -------- */
router.post("/:id/managers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const [college, targetUser] = await Promise.all([
      College.findById(req.params.id),
      AuthUser.findById(userId),
    ]);

    if (!college) return res.status(404).json({ error: "College not found" });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (college.managers.some((m: any) => m.toString() === userId)) {
      return res.status(409).json({ error: "User is already a manager" });
    }

    college.managers.push(targetUser._id as any);
    await college.save();

    // Update user role to manager if currently 'user'
    if (targetUser.role === "user") {
      targetUser.role = "manager";
      await targetUser.save();
    }

    res.json({ college });
  } catch (err) {
    res.status(500).json({ error: "Failed to add manager" });
  }
});

/* -------- REMOVE MANAGER (Admin) -------- */
router.delete("/:id/managers/:userId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: "College not found" });

    college.managers = college.managers.filter(
      (m: any) => m.toString() !== req.params.userId
    ) as any;
    await college.save();

    // Check if user is still a manager of any other college
    const otherColleges = await College.countDocuments({
      managers: req.params.userId,
    });
    if (otherColleges === 0) {
      await AuthUser.findByIdAndUpdate(req.params.userId, { role: "user" });
    }

    res.json({ college });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove manager" });
  }
});

export default router;
