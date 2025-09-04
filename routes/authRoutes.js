import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password properly
    const saltRounds = 10; // cost factor
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Save new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 4. Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("⚠️ Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ Email not found:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Compare passwords
    console.log("🔹 Entered password:", password);
    console.log("🔹 Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔹 Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("⚠️ Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
