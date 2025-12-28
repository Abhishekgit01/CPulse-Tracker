import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://theabhishekrp_db_user:PhgmDkRx89hG976B@cpcluster.k7iqaez.mongodb.net/?appName=CPcluster/cpulse";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
}
