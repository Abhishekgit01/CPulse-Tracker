import { User } from "./models/User";
import { connectDB } from "./db/mongo";
import "./config/loadEnv";
import { recalculateAllCPulseRatings } from "./services/ratingMaintenance";

async function run() {
  console.log("Starting CPulse rating recalculation...");
  await connectDB();

  const existingUsers = await User.countDocuments();
  console.log(`Found ${existingUsers} users to update.`);

  const { totalUsers, updatedUsers } = await recalculateAllCPulseRatings({
    logProgress: true,
  });

  console.log(
    `Recalculation complete. Updated ${updatedUsers} of ${totalUsers} users.`
  );
  process.exit(0);
}

run().catch(err => {
  console.error("Recalculation failed:", err);
  process.exit(1);
});
