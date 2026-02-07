import { Router } from "express";
import { Course } from "../models/Course";
import { College } from "../models/College";
import { AuthUser } from "../models/AuthUser";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { requireCollegeManager } from "../middleware/roles";

const router = Router();

/* -------- LIST COURSES IN COLLEGE -------- */
router.get("/colleges/:collegeId/courses", async (req, res) => {
  try {
    const courses = await Course.find({ collegeId: req.params.collegeId })
      .select("name code description members createdAt")
      .sort({ name: 1 });

    res.json({
      courses: courses.map((c) => ({
        _id: c._id,
        name: c.name,
        code: c.code,
        description: c.description,
        memberCount: c.members.length,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/* -------- GET COURSE DETAILS -------- */
router.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("members", "displayName email cpProfiles")
      .populate("collegeId", "name code");

    if (!course) return res.status(404).json({ error: "Course not found" });

    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

/* -------- CREATE COURSE (Manager/Admin) -------- */
router.post("/colleges/:collegeId/courses", requireAuth, requireCollegeManager, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) return res.status(400).json({ error: "Name and code are required" });

    const college = await College.findById(req.params.collegeId);
    if (!college) return res.status(404).json({ error: "College not found" });

    const existing = await Course.findOne({ collegeId: college._id, code: code.trim() });
    if (existing) return res.status(409).json({ error: "A course with this code already exists in this college" });

    const course = await Course.create({
      name,
      code: code.trim(),
      collegeId: college._id,
      description,
      createdBy: (req as any).user.id,
    });

    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ error: "Failed to create course" });
  }
});

/* -------- UPDATE COURSE (Manager/Admin) -------- */
router.put("/courses/:id", requireAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Check permission
    const user = await AuthUser.findById((req as any).user.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role !== "admin") {
      const college = await College.findById(course.collegeId);
      if (!college || !college.managers.some((m: any) => m.toString() === user._id.toString())) {
        return res.status(403).json({ error: "Not authorized" });
      }
    }

    const { name, description } = req.body;
    if (name) course.name = name;
    if (description !== undefined) course.description = description;
    await course.save();

    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

/* -------- DELETE COURSE (Manager/Admin) -------- */
router.delete("/courses/:id", requireAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user = await AuthUser.findById((req as any).user.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role !== "admin") {
      const college = await College.findById(course.collegeId);
      if (!college || !college.managers.some((m: any) => m.toString() === user._id.toString())) {
        return res.status(403).json({ error: "Not authorized" });
      }
    }

    // Remove course reference from members
    await AuthUser.updateMany({ courseId: course._id }, { $set: { courseId: null } });
    await course.deleteOne();

    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

/* -------- COURSE LEADERBOARD -------- */
router.get("/courses/:id/leaderboard", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("members", "displayName email cpProfiles");
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Get CP data for all members' profiles
    const leaderboard: any[] = [];

    for (const member of course.members as any[]) {
      for (const profile of member.cpProfiles || []) {
        const cpUser = await User.findOne({ handle: profile.handle, platform: profile.platform });
        if (cpUser) {
          leaderboard.push({
            userId: member._id,
            displayName: member.displayName || member.email,
            handle: cpUser.handle,
            platform: cpUser.platform,
            rating: cpUser.rating || 0,
            cpulseRating: cpUser.cpulseRating || 0,
            totalSolved: cpUser.totalSolved || cpUser.problemsSolved || 0,
          });
        }
      }
    }

    leaderboard.sort((a, b) => b.cpulseRating - a.cpulseRating);

    res.json({ leaderboard, courseId: course._id, courseName: course.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
