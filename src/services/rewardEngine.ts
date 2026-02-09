import { UserProfile } from "../models/UserProfile";
import { Reward } from "../models/Reward";

const POINT_THRESHOLDS = [
  { points: 100, type: "theme" as const, items: ["midnight", "ocean"], name: "Basic Themes" },
  { points: 250, type: "border" as const, items: ["gradient"], name: "Gradient Border" },
  { points: 500, type: "frame" as const, items: ["bronze"], name: "Bronze Frame" },
  { points: 750, type: "theme" as const, items: ["hacker", "neon", "cyberpunk"], name: "Premium Themes" },
  { points: 1000, type: "frame" as const, items: ["silver"], name: "Silver Frame" },
  { points: 1500, type: "border" as const, items: ["animated"], name: "Animated Border" },
  { points: 2500, type: "frame" as const, items: ["gold"], name: "Gold Frame" },
  { points: 5000, type: "frame" as const, items: ["diamond"], name: "Diamond Frame" },
];

export async function awardPoints(
  userId: string,
  points: number,
  source: string,
  description: string
) {
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return;

  profile.points += points;
  profile.reputation += Math.floor(points / 2);

  // Check for new unlocks
  for (const threshold of POINT_THRESHOLDS) {
    if (profile.points >= threshold.points) {
      const field =
        threshold.type === "theme"
          ? "unlockedThemes"
          : threshold.type === "border"
          ? "unlockedBorders"
          : "unlockedFrames";

      for (const item of threshold.items) {
        if (!profile[field].includes(item)) {
          profile[field].push(item);
          // Record the unlock reward
          await Reward.create({
            userId,
            type: threshold.type,
            name: threshold.name,
            description: `Unlocked ${item} at ${threshold.points} points`,
            source: "points_milestone",
          });
        }
      }
    }
  }

  await profile.save();

  // Log the points reward
  await Reward.create({
    userId,
    type: "points",
    name: `+${points} points`,
    description,
    points,
    source,
  });
}

export async function checkAndAwardBadge(
  userId: string,
  badgeName: string,
  description: string,
  source: string,
  icon?: string
) {
  const existing = await Reward.findOne({ userId, type: "badge", name: badgeName });
  if (existing) return;

  await Reward.create({
    userId,
    type: "badge",
    name: badgeName,
    description,
    icon,
    source,
  });
}

export async function getOrCreateProfile(userId: string) {
  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = await UserProfile.create({ userId });
  }
  return profile;
}
