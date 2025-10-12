// // routes/timesheets.js (minimal, like projects)
// import { Router } from "express";
// import { getDB } from "../db/connection.js";
// import { ObjectId } from "mongodb";

// const router = Router();

// // Reuse your auth
// function requireAuth(req, res, next) {
//   if (!req.session?.userId) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }
//   next();
// }
// router.use(requireAuth);

// // GET /api/timesheets  -> list current user's entries
// router.get("/", async (req, res) => {
//   const db = getDB();
//   const userId = new ObjectId(req.session.userId);

//   const rows = await db
//     .collection("projects")
//     .find({ userId })
//     .sort({ date: -1, updatedAt: -1 })
//     .toArray();

//   const out = rows.map((r) => ({
//     ...r,
//     _id: r._id.toString(),
//     projectId: r.projectId?.toString() || null,
//   }));
//   res.json(out);
// });

// // POST /api/timesheets -> create entry for current user
// router.post("/", async (req, res) => {
//   const db = getDB();
//   const userId = new ObjectId(req.session.userId);
//   const { date, hours, projectId, comments = "", status = "unpaid" } = req.body;

//   // very light validation (keep it simple like projects)
//   const d = new Date(date);
//   if (!date || isNaN(d))
//     return res.status(400).json({ message: "Invalid date" });

//   const h = Number(hours);
//   if (!(h > 0 && h <= 24))
//     return res.status(400).json({ message: "Hours must be > 0 and ≤ 24" });

//   // optional project link; also snapshot client if you want (cheap lookup)
//   let pid = null;
//   let clientSnap = "";
//   if (projectId) {
//     try {
//       pid = new ObjectId(projectId);
//       const proj = await db
//         .collection("projects")
//         .findOne({ _id: pid, userId });
//       if (!proj) return res.status(400).json({ message: "Project not found" });
//       clientSnap = proj.client || "";
//     } catch {
//       return res.status(400).json({ message: "Invalid projectId" });
//     }
//   }

//   const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
//   const now = new Date();

//   const doc = {
//     userId,
//     projectId: pid, // can be null
//     client: clientSnap, // denormalized for quick display
//     date: dayOnly,
//     hours: Math.round(h * 100) / 100,
//     comments: String(comments).trim(),
//     status, // "unpaid" | "invoiced" | "paid" (you can keep just "unpaid" for now)
//     createdAt: now,
//     updatedAt: now,
//   };

//   const { insertedId } = await db.collection("timesheets").insertOne(doc);
//   res.status(201).json({
//     ...doc,
//     _id: insertedId.toString(),
//     projectId: pid?.toString() || null,
//   });
// });

// export default router;

// routes/timesheets.js
import { Router } from "express";
import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = Router();

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

// GET /api/timesheets/projects - Get user's projects for dropdown
router.get("/projects", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);

  const projects = await db
    .collection("projects")
    .find({ userId })
    .sort({ name: 1 })
    .toArray();

  const formatted = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    client: p.client || "",
  }));

  res.json(formatted);
});

// GET /api/timesheets - List current user's time entries
router.get("/", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);

  // Get all timesheets for this user
  const timesheets = await db
    .collection("timesheets")
    .find({ userId })
    .sort({ date: -1, updatedAt: -1 })
    .toArray();

  // For each timesheet, lookup the project name if projectId exists
  const enriched = await Promise.all(
    timesheets.map(async (ts) => {
      let projectName = "";
      if (ts.projectId) {
        const project = await db
          .collection("projects")
          .findOne({ _id: ts.projectId });
        if (project) {
          projectName = project.name;
        }
      }

      return {
        _id: ts._id.toString(),
        date: ts.date,
        hours: ts.hours,
        projectId: ts.projectId?.toString() || null,
        projectName: projectName,
        client: ts.client || "",
        comments: ts.comments || "",
        status: ts.status || "unpaid",
      };
    })
  );

  res.json(enriched);
});

// POST /api/timesheets - Create new time entry
router.post("/", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);
  const { date, hours, projectId, comments = "", status = "unpaid" } = req.body;

  // Validate date
  const d = new Date(date);
  if (!date || isNaN(d)) {
    return res.status(400).json({ message: "Invalid date" });
  }

  // Validate hours
  const h = Number(hours);
  if (!(h > 0 && h <= 24)) {
    return res.status(400).json({ message: "Hours must be > 0 and ≤ 24" });
  }

  // Optional: validate and link project
  let pid = null;
  let clientSnap = "";
  if (projectId && projectId.trim()) {
    try {
      pid = new ObjectId(projectId);
      const proj = await db.collection("projects").findOne({ _id: pid, userId });
      if (!proj) {
        return res.status(400).json({ message: "Project not found" });
      }
      clientSnap = proj.client || "";
    } catch {
      return res.status(400).json({ message: "Invalid projectId" });
    }
  }

  const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();

  const doc = {
    userId,
    projectId: pid,
    client: clientSnap,
    date: dayOnly,
    hours: Math.round(h * 100) / 100,
    comments: String(comments).trim(),
    status: status || "unpaid",
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

// PUT /api/timesheets/:id - Update time entry
router.put("/:id", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);
  const { id } = req.params;

  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid timesheet ID" });
  }

  const { date, hours, projectId, comments, status } = req.body;

  // Build update object (only update provided fields)
  const updates = {
    updatedAt: new Date(),
  };

  // Validate and update date if provided
  if (date) {
    const d = new Date(date);
    if (isNaN(d)) {
      return res.status(400).json({ message: "Invalid date" });
    }
    updates.date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Validate and update hours if provided
  if (hours !== undefined) {
    const h = Number(hours);
    if (!(h > 0 && h <= 24)) {
      return res.status(400).json({ message: "Hours must be > 0 and ≤ 24" });
    }
    updates.hours = Math.round(h * 100) / 100;
  }

  // Update project if provided
  if (projectId !== undefined) {
    if (projectId && projectId.trim()) {
      try {
        const pid = new ObjectId(projectId);
        const proj = await db
          .collection("projects")
          .findOne({ _id: pid, userId });
        if (!proj) {
          return res.status(400).json({ message: "Project not found" });
        }
        updates.projectId = pid;
        updates.client = proj.client || "";
      } catch {
        return res.status(400).json({ message: "Invalid projectId" });
      }
    } else {
      // Clear project link
      updates.projectId = null;
      updates.client = "";
    }
  }

  // Update comments if provided
  if (comments !== undefined) {
    updates.comments = String(comments).trim();
  }

  // Update status if provided
  if (status !== undefined) {
    updates.status = status;
  }

  // Update the timesheet
  const result = await db.collection("timesheets").updateOne(
    {
      _id: new ObjectId(id),
      userId: userId, // Ensure user owns this timesheet
    },
    {
      $set: updates,
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: "Timesheet not found" });
  }

  // Return updated timesheet
  const updated = await db
    .collection("timesheets")
    .findOne({ _id: new ObjectId(id) });

  res.json({
    ...updated,
    _id: updated._id.toString(),
    projectId: updated.projectId?.toString() || null,
  });
});

// DELETE /api/timesheets/:id - Delete time entry
router.delete("/:id", async (req, res) => {
  const db = getDB();
  const userId = new ObjectId(req.session.userId);
  const { id } = req.params;

  // Validate ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid timesheet ID" });
  }

  // Delete the timesheet
  const result = await db.collection("timesheets").deleteOne({
    _id: new ObjectId(id),
    userId: userId, // Ensure user owns this timesheet
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Timesheet not found" });
  }

  // Return 204 No Content (successful deletion)
  res.status(204).end();
});

export default router;
