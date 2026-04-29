import { Router } from "express";
import bcrypt from "bcryptjs";
import { AuthUser } from "../models/AuthUser";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/roles";

const router = Router();

/* -------- SEED ADMIN (one-time) -------- */
router.post("/seed", async (_req, res) => {
  try {
    const existing = await AuthUser.findOne({ email: "admin@cpulse.com" });
    if (existing) {
      // Ensure role is admin
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
      }
      return res.json({ message: "Admin account already exists", userId: existing._id });
    }

    const hashed = await bcrypt.hash("CPulse@Admin2024", 10);
    const admin = await AuthUser.create({
      email: "admin@cpulse.com",
      password: hashed,
      displayName: "CPulse Admin",
      role: "admin",
      onboarded: true,
    });

    res.status(201).json({ message: "Admin account created", userId: admin._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to seed admin" });
  }
});

/* -------- CLEANUP STALE DATA -------- */
router.post("/cleanup", async (_req, res) => {
  try {
    const results: any = {};

    // 1. Remove duplicate User entries (same handle+platform, keep newest)
    const pipeline = await User.aggregate([
      { $group: { _id: { handle: "$handle", platform: "$platform" }, count: { $sum: 1 }, ids: { $push: "$_id" }, dates: { $push: "$updatedAt" } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    let removedDuplicates = 0;
    for (const group of pipeline) {
      // Keep the most recently updated, delete the rest
      const idsWithDates = group.ids.map((id: any, i: number) => ({ id, date: group.dates[i] }));
      idsWithDates.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const toDelete = idsWithDates.slice(1).map((x: any) => x.id);
      if (toDelete.length > 0) {
        await User.deleteMany({ _id: { $in: toDelete } });
        removedDuplicates += toDelete.length;
      }
    }
    results.removedDuplicates = removedDuplicates;

    // 2. Remove User entries with no handle or platform
    const noHandle = await User.deleteMany({ $or: [{ handle: { $exists: false } }, { handle: "" }, { platform: { $exists: false } }] });
    results.removedInvalid = noHandle.deletedCount;

    // 3. Count remaining
    results.totalUsers = await User.countDocuments();
    results.totalAuthUsers = await AuthUser.countDocuments();

    res.json({ success: true, cleanup: results });
  } catch (err: any) {
    res.status(500).json({ error: "Cleanup failed: " + err.message });
  }
});

/* -------- SET USER ROLE (Admin) -------- */
router.post("/users/:userId/role", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "manager", "admin"].includes(role)) {
      return res.status(400).json({ error: "Valid role is required (user, manager, admin)" });
    }

    const user = await AuthUser.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

/* -------- LIST ALL USERS (Admin) -------- */
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await AuthUser.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
