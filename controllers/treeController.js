import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new family tree
export const createTree = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tree name is required" });
    }

    const tree = await prisma.tree.create({
      data: {
        name,
        userId: req.user.id, // logged-in user from verifyToken
      },
    });

    res.status(201).json(tree);
  } catch (error) {
    console.error("Error creating tree:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all trees for a logged-in user
export const getUserTrees = async (req, res) => {
  try {
    const trees = await prisma.tree.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: { id: "desc" },
    });

    res.json(trees);
  } catch (error) {
    console.error("Error fetching trees:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/trees/:id
export const getTreeById = async (req, res) => {
  try {
    const { id } = req.params;
    const tree = await prisma.tree.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tree) return res.status(404).json({ message: "Tree not found" });
    res.json(tree);
  } catch (err) {
    console.error("Error fetching tree:", err);
    res.status(500).json({ message: "Server error" });
  }
};
