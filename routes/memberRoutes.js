import express from "express";
import {
  addMember,
  getTreeMembers,
  deleteMember,
  updateMember,
  getMemberById,
} from "../controllers/memberController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import upload from "../middleware/upload.js";

const prisma = new PrismaClient();

const router = express.Router();

// Add a member to a tree
// Add member WITH image upload support
router.post("/", verifyToken, upload.single("photo"), addMember);

// Get member details by ID
router.get("/details/:id", verifyToken, getMemberById);

// Get all members for a tree
router.get("/:treeId", verifyToken, getTreeMembers);

// Delete a member (and all descendants)
router.delete("/:memberId", verifyToken, deleteMember);

router.put(
  "/:id",
  verifyToken,
  upload.single("photo"),
  (req, res, next) => {
    console.log("🟡 PUT /members/:id Request Received");
    next();
  },
  updateMember
);

export default router;
