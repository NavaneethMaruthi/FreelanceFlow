// routes/projects.js
import { Router } from "express";
import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// GET /api/projects  -> list current user's projects
router.get("/", async (req, res) => {
  const db = getDB();
  const raw = await db
    .collection("projects")
    .find({ userId: new ObjectId(req.session.userId) })
    .sort({ updatedAt: -1 })
    .toArray();

  const projects = raw.map((p) => ({ ...p, _id: p._id.toString() }));
  res.json(projects);
});

// POST /api/projects -> create project for current user
router.post("/", async (req, res) => {
  const db = getDB();
  const { name, client, status, deadline } = req.body;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Project title is required" });
  }

  const allowedStatus = new Set(["todo", "active", "paused", "completed"]);
  const doc = {
    userId: new ObjectId(req.session.userId),
    name: name.trim(),
    client: (client || "").trim(),
    status: allowedStatus.has((status || "").toLowerCase())
      ? status.toLowerCase()
      : "active",
    deadline: deadline ? new Date(deadline) : null, // accepts yyyy-mm-dd
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("projects").insertOne(doc);
  res.status(201).json({ ...doc, _id: result.insertedId.toString() });
});

// DELETE /api/projects/:id -> delete one of the current user's projects
router.delete("/:id", async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  const result = await db.collection("projects").deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(req.session.userId),
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.status(204).end();
});

export default router;
