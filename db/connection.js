import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = "freelanceflow";

let db = null;

export async function connectDB() {
  if (db) return db;

  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}
