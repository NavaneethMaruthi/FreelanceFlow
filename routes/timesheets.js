// routes/timesheets.js (minimal, like projects)
import { Router } from "express";
import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

// Reuse your auth
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}
router.use(requireAuth);

// GET /api/timesheets  -> list current user's entries
router.get("/", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);

  const rows = await db
    .collection("projects")
    .find({ userId })
    .sort({ date: -1, updatedAt: -1 })
    .toArray();

  const out = rows.map((r) => ({
    ...r,
    _id: r._id.toString(),
    projectId: r.projectId?.toString() || null,
  }));
  res.json(out);
});

// POST /api/timesheets -> create entry for current user
router.post("/", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);
  const { date, hours, projectId, comments = "", status = "unpaid" } = req.body;

  // very light validation (keep it simple like projects)
  const d = new Date(date);
  if (!date || isNaN(d))
    return res.status(400).json({ message: "Invalid date" });

  const h = Number(hours);
  if (!(h > 0 && h <= 24))
    return res.status(400).json({ message: "Hours must be > 0 and ≤ 24" });

  // optional project link; also snapshot client if you want (cheap lookup)
  let pid = null;
  let clientSnap = "";
  if (projectId) {
    try {
      pid = new ObjectId(projectId);
      const proj = await db
        .collection("projects")
        .findOne({ _id: pid, userId });
      if (!proj) return res.status(400).json({ message: "Project not found" });
      clientSnap = proj.client || "";
    } catch {
      return res.status(400).json({ message: "Invalid projectId" });
    }
  }

  const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();

  const doc = {
    userId,
    projectId: pid, // can be null
    client: clientSnap, // denormalized for quick display
    date: dayOnly,
    hours: Math.round(h * 100) / 100,
    comments: String(comments).trim(),
    status, // "unpaid" | "invoiced" | "paid" (you can keep just "unpaid" for now)
    createdAt: now,
    updatedAt: now,
  };

  const { insertedId } = await db.collection("timesheets").insertOne(doc);
  res.status(201).json({
    ...doc,
    _id: insertedId.toString(),
    projectId: pid?.toString() || null,
  });
});

export default router;
