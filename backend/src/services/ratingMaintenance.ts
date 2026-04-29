import { User } from "../models/User";
import { calculateCPulseRating } from "./cpulseRating";

export async function recalculateAllCPulseRatings(options?: {
  logProgress?: boolean;
}) {
  const { logProgress = false } = options || {};
  const users = await User.find({});
  let updatedUsers = 0;

  for (const user of users) {
    const oldRating = user.cpulseRating;
    const newRating = calculateCPulseRating(user as any);

    user.cpulseRating = newRating;
    await user.save();

    if (oldRating !== newRating) {
      updatedUsers++;
    }

    if (logProgress) {
      console.log(
        `Updated ${user.handle} (@${user.platform}): ${oldRating} -> ${newRating}`
      );
    }
  }

  return {
    totalUsers: users.length,
    updatedUsers,
  };
}
