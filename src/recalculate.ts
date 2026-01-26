import { User } from "./models/User";
import { connectDB } from "./db/mongo";
import { calculateCPulseRating } from "./services/cpulseRating";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    console.log("Starting CPulse rating recalculation...");
    await connectDB();

    const users = await User.find({});
    console.log(`Found ${users.length} users to update.`);

    for (const user of users) {
        const oldRating = user.cpulseRating;
        const newRating = calculateCPulseRating(user as any);

        user.cpulseRating = newRating;
        await user.save();

        console.log(`Updated ${user.handle} (@${user.platform}): ${oldRating} -> ${newRating}`);
    }

    console.log("Recalculation complete. Exiting.");
    process.exit(0);
}

run().catch(err => {
    console.error("Recalculation failed:", err);
    process.exit(1);
});
