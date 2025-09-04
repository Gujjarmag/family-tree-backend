import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import treeRoutes from "./routes/treeRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import path from "path";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Family Tree API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Tree and Member APIs
app.use("/api/trees", treeRoutes);
app.use("/api/members", memberRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
