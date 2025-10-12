import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import projectsRoutes from "./routes/projects.js";
import timesheetsRouter from "./routes/timesheets.js";

// Load environment variables
dotenv.config();

console.log("Starting FreelanceFlow backend...");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 86400000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Serve static frontend files
app.use(express.static("frontend"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/timesheets", timesheetsRouter);

// Connect to database and start server
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV}`);
      console.log("📁 Serving frontend from /frontend");
      console.log("🔐 Auth routes available at /api/auth");
      console.log("📂 Projects routes available at /api/projects");
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  });
