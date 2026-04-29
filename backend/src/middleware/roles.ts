import { AuthUser } from "../models/AuthUser";
import { College } from "../models/College";

export function requireAdmin(req: any, res: any, next: any) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  AuthUser.findById(userId)
    .then((user) => {
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    })
    .catch(() => res.status(500).json({ error: "Authorization check failed" }));
}

export function requireManager(req: any, res: any, next: any) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  AuthUser.findById(userId)
    .then((user) => {
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return res.status(403).json({ error: "Manager access required" });
      }
      next();
    })
    .catch(() => res.status(500).json({ error: "Authorization check failed" }));
}

export function requireCollegeManager(req: any, res: any, next: any) {
  const userId = req.user?.id;
  const collegeId = req.params.collegeId || req.body.collegeId;

  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  Promise.all([AuthUser.findById(userId), College.findById(collegeId)])
    .then(([user, college]) => {
      if (!user) return res.status(401).json({ error: "User not found" });
      if (!college) return res.status(404).json({ error: "College not found" });

      if (user.role === "admin") return next();
      if (college.managers.some((m: any) => m.toString() === userId)) return next();

      return res.status(403).json({ error: "You are not a manager of this college" });
    })
    .catch(() => res.status(500).json({ error: "Authorization check failed" }));
}
