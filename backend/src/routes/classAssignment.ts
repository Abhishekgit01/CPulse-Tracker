import { Router } from "express";
import { User } from "../models/User";

const router = Router();

router.get("/classes", async (_req, res) => {
  try {
    const classes = await User.distinct("classId", {
      classId: { $ne: "general" },
    });

    res.json(classes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/class/add", async (req, res) => {
  const { handle, platform, classId } = req.body;

  if (!handle || !platform || !classId) {
    return res
      .status(400)
      .json({ error: "handle, platform, and classId are required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { handle, platform },
      { classId },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Search user first." });
    }

    res.json({
      message: "User added to class successfully",
      user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
