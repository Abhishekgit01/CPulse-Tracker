import { Router } from "express";
import bcrypt from "bcryptjs";
import { AuthUser } from "../models/AuthUser";
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
