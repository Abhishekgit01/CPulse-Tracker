import { Router } from "express";
import { JoinRequest } from "../models/JoinRequest";
import { AuthUser } from "../models/AuthUser";
import { College } from "../models/College";
import { Course } from "../models/Course";
import { requireAuth } from "../middleware/auth";

const router = Router();

/* -------- CREATE JOIN REQUEST -------- */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { collegeId, courseId, message } = req.body;

    if (!collegeId || !courseId) {
      return res.status(400).json({ error: "collegeId and courseId are required" });
    }

    const [college, course, user] = await Promise.all([
      College.findById(collegeId),
      Course.findById(courseId),
      AuthUser.findById(userId),
    ]);

    if (!college) return res.status(404).json({ error: "College not found" });
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (course.collegeId.toString() !== collegeId) {
      return res.status(400).json({ error: "Course does not belong to this college" });
    }

    // Check if user already in this course
    if (user.courseId && user.courseId.toString() === courseId) {
      return res.status(409).json({ error: "You are already in this course" });
    }

    // Check if pending request already exists for this course
    const existing = await JoinRequest.findOne({
      userId,
      courseId,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({ error: "You already have a pending request for this course" });
    }

    const request = await JoinRequest.create({
      userId,
      collegeId,
      courseId,
      message,
    });

    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ error: "Failed to create join request" });
  }
});

/* -------- GET MY REQUESTS -------- */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const requests = await JoinRequest.find({ userId: (req as any).user.id })
      .populate("collegeId", "name code")
      .populate("courseId", "name code")
      .sort({ requestedAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

/* -------- GET PENDING REQUESTS FOR COLLEGE (Manager) -------- */
router.get("/college/:collegeId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { collegeId } = req.params;

    const [user, college] = await Promise.all([
      AuthUser.findById(userId),
      College.findById(collegeId),
    ]);

    if (!user) return res.status(401).json({ error: "User not found" });
    if (!college) return res.status(404).json({ error: "College not found" });

    // Check if user is admin or manager of this college
    if (user.role !== "admin" && !college.managers.some((m: any) => m.toString() === userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const requests = await JoinRequest.find({ collegeId, status: "pending" })
      .populate("userId", "displayName email cpProfiles")
      .populate("courseId", "name code")
      .sort({ requestedAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

/* -------- APPROVE REQUEST (Manager) -------- */
router.post("/:id/approve", requireAuth, async (req, res) => {
  try {
    const managerId = (req as any).user.id;
    const request = await JoinRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ error: "Request already processed" });

    const [manager, college] = await Promise.all([
      AuthUser.findById(managerId),
      College.findById(request.collegeId),
    ]);

    if (!manager) return res.status(401).json({ error: "User not found" });
    if (!college) return res.status(404).json({ error: "College not found" });

    if (manager.role !== "admin" && !college.managers.some((m: any) => m.toString() === managerId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Approve: update request
    request.status = "approved";
    request.processedAt = new Date();
    request.processedBy = manager._id as any;
    await request.save();

    // Update user's college/course
    const targetUser = await AuthUser.findById(request.userId);
    if (targetUser) {
      // Remove from old course if switching
      if (targetUser.courseId) {
        await Course.findByIdAndUpdate(targetUser.courseId, {
          $pull: { members: targetUser._id },
        });
      }

      targetUser.collegeId = request.collegeId as any;
      targetUser.courseId = request.courseId as any;
      await targetUser.save();

      // Add to course members
      if (request.courseId) {
        await Course.findByIdAndUpdate(request.courseId, {
          $addToSet: { members: targetUser._id },
        });
      }
    }

    res.json({ request, message: "Request approved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve request" });
  }
});

/* -------- REJECT REQUEST (Manager) -------- */
router.post("/:id/reject", requireAuth, async (req, res) => {
  try {
    const managerId = (req as any).user.id;
    const request = await JoinRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ error: "Request already processed" });

    const [manager, college] = await Promise.all([
      AuthUser.findById(managerId),
      College.findById(request.collegeId),
    ]);

    if (!manager) return res.status(401).json({ error: "User not found" });
    if (!college) return res.status(404).json({ error: "College not found" });

    if (manager.role !== "admin" && !college.managers.some((m: any) => m.toString() === managerId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    request.status = "rejected";
    request.processedAt = new Date();
    request.processedBy = manager._id as any;
    await request.save();

    res.json({ request, message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject request" });
  }
});

/* -------- CANCEL MY REQUEST -------- */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const request = await JoinRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.userId.toString() !== userId) {
      return res.status(403).json({ error: "Not your request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Can only cancel pending requests" });
    }

    await request.deleteOne();
    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel request" });
  }
});

export default router;
