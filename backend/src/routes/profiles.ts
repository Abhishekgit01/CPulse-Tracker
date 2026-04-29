import { Router } from "express";
import { UserProfile } from "../models/UserProfile";
import { Reward } from "../models/Reward";
import { Post } from "../models/Post";
import { AuthUser } from "../models/AuthUser";
import { requireAuth } from "../middleware/auth";
import { getOrCreateProfile, awardPoints, checkAndAwardBadge } from "../services/rewardEngine";

const router = Router();

/* -------- GET PUBLIC PROFILE -------- */
router.get("/:userId", async (req, res) => {
  try {
    const authUser = await AuthUser.findById(req.params.userId).select("-password").lean();
    if (!authUser) return res.status(404).json({ error: "User not found" });

    const profile = await getOrCreateProfile(req.params.userId);

    // Get recent posts
    const recentPosts = await Post.find({ authorId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title type createdAt upvotes downvotes commentCount viewCount tags")
      .lean();

    const postsWithScore = recentPosts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      score: (p.upvotes?.length || 0) - (p.downvotes?.length || 0),
    }));

    // Get badges
    const badges = await Reward.find({ userId: req.params.userId, type: "badge" })
      .sort({ earnedAt: -1 })
      .lean();

    res.json({
      success: true,
      user: {
        _id: (authUser as any)._id.toString(),
        displayName: authUser.displayName,
        email: authUser.email,
        cpProfiles: authUser.cpProfiles,
        createdAt: authUser.createdAt,
      },
      profile: profile.toObject(),
      recentPosts: postsWithScore,
      badges,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* -------- UPDATE OWN PROFILE -------- */
router.patch("/me/update", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getOrCreateProfile(userId);
    const { bio, location, skills, socialLinks } = req.body;

    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (skills !== undefined) profile.skills = skills;
    if (socialLinks !== undefined) {
      if (socialLinks.github !== undefined) profile.socialLinks.github = socialLinks.github;
      if (socialLinks.linkedin !== undefined) profile.socialLinks.linkedin = socialLinks.linkedin;
      if (socialLinks.twitter !== undefined) profile.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.portfolio !== undefined) profile.socialLinks.portfolio = socialLinks.portfolio;
    }

    await profile.save();

    // Check if profile is complete
    const isComplete = profile.bio && profile.location && profile.skills.length > 0;
    if (isComplete) {
      const existingBadge = await Reward.findOne({ userId, type: "badge", name: "Complete Profile" });
      if (!existingBadge) {
        await awardPoints(userId, 30, "complete_profile", "Completed your profile");
        await checkAndAwardBadge(userId, "Complete Profile", "Filled out your profile info", "complete_profile");
      }
    }

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/* -------- APPLY CUSTOMIZATION -------- */
router.post("/me/customize", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getOrCreateProfile(userId);
    const { theme, borderStyle, avatarFrame, bannerColor, badgeShowcase } = req.body;

    if (theme && profile.unlockedThemes.includes(theme)) profile.theme = theme;
    if (borderStyle && profile.unlockedBorders.includes(borderStyle)) profile.borderStyle = borderStyle;
    if (avatarFrame && profile.unlockedFrames.includes(avatarFrame)) profile.avatarFrame = avatarFrame;
    if (bannerColor) profile.bannerColor = bannerColor;
    if (badgeShowcase) profile.badgeShowcase = badgeShowcase.slice(0, 5);

    await profile.save();
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to customize profile" });
  }
});

/* -------- GET MY REWARDS -------- */
router.get("/me/rewards", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const rewards = await Reward.find({ userId }).sort({ earnedAt: -1 }).lean();
    const profile = await getOrCreateProfile(userId);
    res.json({ success: true, rewards, points: profile.points, reputation: profile.reputation });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

export default router;
