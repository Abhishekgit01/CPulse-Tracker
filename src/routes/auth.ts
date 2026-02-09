import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthUser } from "../models/AuthUser";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { requireAuth } from "../middleware/auth";
import { getLeetCodeUser } from "../services/leetcode";
import { getUserInfo } from "../services/codeforces";
import { getCodeChefUser } from "../services/codechef";
import { calculateCPulseScore, PlatformProfile } from "../services/cpulseRating";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function generateToken(user: any) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user: any) {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    cpProfiles: user.cpProfiles,
    onboarded: user.onboarded,
    role: user.role || "user",
    collegeId: user.collegeId || null,
    courseId: user.courseId || null,
    college: user.populatedCollege || null,
    course: user.populatedCourse || null,
  };
}

/* -------- LEAVE COURSE -------- */
router.post("/leave-course", requireAuth, async (req, res) => {
  try {
    const user = await AuthUser.findById((req as any).user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.courseId) {
      await Course.findByIdAndUpdate(user.courseId, {
        $pull: { members: user._id },
      });
      user.courseId = undefined;
      await user.save();
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("LEAVE COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to leave course" });
  }
});

/* -------- LEAVE COLLEGE -------- */
router.post("/leave-college", requireAuth, async (req, res) => {
  try {
    const user = await AuthUser.findById((req as any).user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.courseId) {
      await Course.findByIdAndUpdate(user.courseId, {
        $pull: { members: user._id },
      });
    }

    user.collegeId = undefined;
    user.courseId = undefined;
    await user.save();

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("LEAVE COLLEGE ERROR:", err);
    res.status(500).json({ error: "Failed to leave college" });
  }
});

/* -------- REGISTER -------- */
router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    const { email, password, displayName } = body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await AuthUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await AuthUser.create({
      email: email.toLowerCase(),
      password: hashed,
      displayName: displayName || email.split("@")[0],
    });

    const token = generateToken(user);

    res.json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* -------- LOGIN -------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await AuthUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------- RESET PASSWORD -------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await AuthUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: "If an account with that email exists, a new password has been generated.",
        success: true,
        newPassword: null
      });
    }

    // Generate a simple random password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let newPassword = "";
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Hash and save the new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // NOTE: In production, you would send this via email instead of returning it
    // For now, we return it directly since email is not configured
    res.json({
      message: "Password has been reset successfully!",
      success: true,
      newPassword: newPassword,
      note: "Please save this password and change it after logging in."
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/* -------- GET CURRENT USER -------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await AuthUser.findById((req as any).user.id)
      .select("-password")
      .populate("collegeId", "name code description")
      .populate("courseId", "name code description");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userObj: any = user.toObject();
    userObj.populatedCollege = userObj.collegeId && typeof userObj.collegeId === "object" ? userObj.collegeId : null;
    userObj.populatedCourse = userObj.courseId && typeof userObj.courseId === "object" ? userObj.courseId : null;
    // Reset to ObjectId strings for sanitizeUser
    userObj.collegeId = user.collegeId?._id || user.collegeId || null;
    userObj.courseId = user.courseId?._id || user.courseId || null;
    res.json({ user: sanitizeUser(userObj) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/* -------- ADD CP PROFILE -------- */
router.post("/profiles", requireAuth, async (req, res) => {
  try {
    const { platform, handle } = req.body;

    if (!platform || !handle) {
      return res.status(400).json({ error: "Platform and handle are required" });
    }

    if (!["leetcode", "codeforces", "codechef"].includes(platform)) {
      return res.status(400).json({ error: "Invalid platform" });
    }

    const user = await AuthUser.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if profile already exists
    const exists = user.cpProfiles.find(
      (p) => p.platform === platform && p.handle.toLowerCase() === handle.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ error: "This profile is already linked" });
    }

    // Verify the handle exists on the platform
    try {
      if (platform === "leetcode") {
        await getLeetCodeUser(handle);
      } else if (platform === "codeforces") {
        await getUserInfo(handle);
      } else if (platform === "codechef") {
        await getCodeChefUser(handle);
      }
    } catch (verifyErr: any) {
      return res.status(400).json({
        error: `Could not verify "${handle}" on ${platform}. Please check the username.`,
      });
    }

    user.cpProfiles.push({
      platform,
      handle: handle.trim(),
      verified: true,
      addedAt: new Date(),
    });

    if (!user.onboarded) {
      user.onboarded = true;
    }

    await user.save();

    res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    console.error("ADD PROFILE ERROR:", err);
    res.status(500).json({ error: "Failed to add profile" });
  }
});

/* -------- REMOVE CP PROFILE -------- */
router.delete("/profiles/:platform/:handle", requireAuth, async (req, res) => {
  try {
    const { platform, handle } = req.params;

    const user = await AuthUser.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const idx = user.cpProfiles.findIndex(
      (p) => p.platform === platform && p.handle.toLowerCase() === handle.toLowerCase()
    );

    if (idx === -1) {
      return res.status(404).json({ error: "Profile not found" });
    }

    user.cpProfiles.splice(idx, 1);
    await user.save();

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("REMOVE PROFILE ERROR:", err);
    res.status(500).json({ error: "Failed to remove profile" });
  }
});

/* -------- GET AGGREGATED PROFILE DATA -------- */
router.get("/profiles/data", requireAuth, async (req, res) => {
  try {
    const user = await AuthUser.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profileData: any[] = [];

    for (const profile of user.cpProfiles) {
      try {
        let data: any;
        if (profile.platform === "leetcode") {
          data = await getLeetCodeUser(profile.handle);
        } else if (profile.platform === "codeforces") {
          data = await getUserInfo(profile.handle);
        } else if (profile.platform === "codechef") {
          data = await getCodeChefUser(profile.handle);
        }
        profileData.push({ ...data, platform: profile.platform, handle: profile.handle });
      } catch (err: any) {
        profileData.push({
          platform: profile.platform,
          handle: profile.handle,
          error: err.message,
        });
      }
    }

    res.json({ profiles: profileData });
  } catch (err) {
    console.error("PROFILE DATA ERROR:", err);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});



/* -------- COMPLETE ONBOARDING -------- */
router.post("/onboarding/complete", requireAuth, async (req, res) => {
  try {
    const user = await AuthUser.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.onboarded = true;
    await user.save();

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

/* -------- GET AGGREGATED CPULSE SCORE -------- */
router.get("/cpulse-score", requireAuth, async (req, res) => {
  try {
    const authUser = await AuthUser.findById((req as any).user.id);
    if (!authUser) return res.status(404).json({ error: "User not found" });

    if (authUser.cpProfiles.length === 0) {
      const result = calculateCPulseScore([]);
      return res.json(result);
    }

    // Build platform profiles from the User collection (cached platform data)
    const profiles: PlatformProfile[] = [];

    for (const cp of authUser.cpProfiles) {
      const userDoc = await User.findOne({ handle: cp.handle, platform: cp.platform });
      if (userDoc) {
        profiles.push({
          platform: cp.platform,
          data: userDoc.toObject(),
          updatedAt: userDoc.updatedAt,
        });
      } else {
        // If no cached data, try to fetch live data
        try {
          let data: any = {};
          if (cp.platform === "leetcode") {
            data = await getLeetCodeUser(cp.handle);
          } else if (cp.platform === "codeforces") {
            data = await getUserInfo(cp.handle);
          } else if (cp.platform === "codechef") {
            data = await getCodeChefUser(cp.handle);
          }
          profiles.push({
            platform: cp.platform,
            data,
            updatedAt: new Date(),
          });
        } catch {
          // Skip this profile if fetch fails
        }
      }
    }

    const result = calculateCPulseScore(profiles);
    res.json(result);
  } catch (err) {
    console.error("CPULSE SCORE ERROR:", err);
    res.status(500).json({ error: "Failed to calculate CPulse score" });
  }
});

// Export auth router
export default router;
