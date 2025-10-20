import express from "express";
import bcrypt from "bcryptjs";
import { getDB } from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// POST /api/auth/signup - Register new user
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validate input
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//       });
//     }

//     // Validate password length
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 6 characters",
//       });
//     }

//     const db = getDB();
//     const usersCollection = db.collection("users");

//     // Check if user already exists
//     const existingUser = await usersCollection.findOne({
//       email: email.toLowerCase(),
//     });
//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user document
//     const newUser = {
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       createdAt: new Date(),
//     };

//     // Insert into database
//     const result = await usersCollection.insertOne(newUser);

//     // Create session
//     req.session.userId = result.insertedId.toString();

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user: {
//         id: result.insertedId,
//         name,
//         email: email.toLowerCase(),
//       },
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during registration",
//     });
//   }
// });

// POST /api/auth/signup - Register new user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ... (keep all your validation code) ...

    // Insert into database
    const result = await usersCollection.insertOne(newUser);

    // Create session and SAVE IT
    req.session.userId = result.insertedId.toString();
    
    // CRITICAL: Save the session before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create session",
        });
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: result.insertedId,
          name,
          email: email.toLowerCase(),
        },
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// // POST /api/auth/login - Login user
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     const db = getDB();
//     const usersCollection = db.collection("users");

//     // Find user by email
//     const user = await usersCollection.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // Compare password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // Create session
//     req.session.userId = user._id.toString();

//     res.json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during login",
//     });
//   }
// });

// POST /api/auth/login - Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const db = getDB();
    const usersCollection = db.collection("users");

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create session and SAVE IT
    req.session.userId = user._id.toString();
    
    // CRITICAL: Save the session before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create session",
        });
      }

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// POST /api/auth/logout - Logout user
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

// GET /api/auth/check - Check if user is logged in
router.get("/check", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.json({
        success: false,
        loggedIn: false,
      });
    }

    const db = getDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(req.session.userId),
    });

    if (!user) {
      return res.json({
        success: false,
        loggedIn: false,
      });
    }

    res.json({
      success: true,
      loggedIn: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
