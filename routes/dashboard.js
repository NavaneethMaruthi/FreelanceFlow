import { Router } from "express";
import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// GET /api/dashboard - Get dashboard summary
router.get("/", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);

  // Get total hours worked
  const timesheets = await db
    .collection("timesheets")
    .find({ userId })
    .toArray();

  const totalHours = timesheets.reduce(
    (sum, entry) => sum + (entry.hours || 0),
    0,
  );

  // Get top 3 active projects
  const activeProjects = await db
    .collection("projects")
    .find({
      userId,
      status: "active",
    })
    .sort({ updatedAt: -1 })
    .limit(3)
    .toArray();

  const formattedProjects = activeProjects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    client: p.client || "",
    status: p.status,
    deadline: p.deadline,
  }));

  const totalProjects = await db
    .collection("projects")
    .countDocuments({ userId });

  res.json({
    totalHours: Math.round(totalHours * 100) / 100,
    activeProjects: formattedProjects,
    totalProjects: totalProjects,
  });
});

export default router;
