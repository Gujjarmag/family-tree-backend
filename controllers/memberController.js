import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Add a new member to a tree
export const addMember = async (req, res) => {
  try {
    const { treeId, name, dob, gender, parentId, relationType } = req.body;
    console.log("📌 Incoming Request:", req.body);

    if (!treeId || !name) {
      return res.status(400).json({ message: "Tree ID and name are required" });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`; // Save relative path
    }

    let finalParentId = parentId;

    // 🟢 Handle SIBLING (Works for root + normal nodes)
    if (relationType === "sibling") {
      console.log("➡️ Adding SIBLING for:", parentId);
      if (!parentId) {
        // If parentId is missing, fetch the selected member using name instead
        const selectedMember = await prisma.member.findUnique({
          where: { id: Number(req.body.id) }, // <-- We'll pass node id instead of parentId from frontend
        });

        if (!selectedMember) {
          console.log("❌ Selected member not found");
          return res.status(400).json({ message: "Selected member not found" });
        }

        // If the selected member has NO parent (it's a root) → create virtual parent
        if (!selectedMember.parentId) {
          console.log("⚡ Root node detected → creating virtual parent...");
          const virtualParent = await prisma.member.create({
            data: {
              name: "Unknown Parent",
              treeId: parseInt(treeId),
            },
          });
          console.log("✅ Virtual Parent Created:", virtualParent);

          // Attach the selected member to the virtual parent
          await prisma.member.update({
            where: { id: selectedMember.id },
            data: { parentId: virtualParent.id },
          });

          finalParentId = virtualParent.id;
        } else {
          // The selected node has a parent → normal sibling creation
          finalParentId = selectedMember.parentId;
        }
      } else {
        console.log("ℹ️ Non-root sibling detected, using existing parent");
        // When parentId exists, just use it
        finalParentId = parentId;
      }
    }

    // 🟢 Handle PARENT CREATION
    if (relationType === "parent") {
      console.log("➡️ Adding PARENT for:", parentId);
      // Create the new parent first.
      const newParent = await prisma.member.create({
        data: {
          name,
          dob: dob ? new Date(dob) : null,
          gender,
          treeId: parseInt(treeId),
        },
      });

      // Update the selected member to attach under this new parent.
      await prisma.member.update({
        where: { id: parentId },
        data: { parentId: newParent.id },
      });

      console.log("✅ Parent created successfully:", newParent);
      return res.status(201).json(newParent);
    }

    // 🟢 Normal member creation (child or sibling handled here)
    console.log("➡️ Creating Member Under Parent ID:", finalParentId);
    const member = await prisma.member.create({
      data: {
        name,
        dob: dob ? new Date(dob) : null,
        gender,
        treeId: parseInt(treeId),
        parentId: parentId ? Number(parentId) : null,
        photoUrl: photoUrl,
      },
    });
    console.log("✅ Member Created:", member);

    res.status(201).json(member);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all members of a tree
export const getTreeMembers = async (req, res) => {
  try {
    const { treeId } = req.params;

    const members = await prisma.member.findMany({
      where: { treeId: parseInt(treeId) },
      include: { children: true, spouse: true },
    });

    // ✅ Ensure photoUrl is a full URL if an image exists
    const updatedMembers = members.map((member) => ({
      ...member,
      photoUrl: member.photoUrl
        ? `http://localhost:5000${member.photoUrl}`
        : null,
    }));

    res.json(updatedMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Recursive delete function
const deleteMemberAndChildren = async (memberId) => {
  const children = await prisma.member.findMany({
    where: { parentId: memberId },
  });

  for (const child of children) {
    await deleteMemberAndChildren(child.id);
  }

  await prisma.member.delete({
    where: { id: memberId },
  });
};

// Controller
export const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await prisma.member.findUnique({
      where: { id: Number(memberId) },
    });

    if (!member) return res.status(404).json({ message: "Member not found" });

    await deleteMemberAndChildren(member.id);

    res
      .status(200)
      .json({ message: "Member and descendants deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a member
export const updateMember = async (req, res) => {
  try {
    console.log(`✅ Member updated: ${req.params.id}`);

    const { id } = req.params;
    const { name, dob, gender, notes } = req.body;

    let parsedDob = undefined;
    if (typeof dob !== "undefined" && dob !== "") {
      parsedDob = new Date(dob);
      if (isNaN(parsedDob)) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    } else if (typeof dob !== "undefined" && dob === "") {
      parsedDob = null;
    }

    // Build partial update object (only set fields that exist in request)
    const updatedData = {};
    if (typeof name !== "undefined") updatedData.name = name;
    if (typeof dob !== "undefined") updatedData.dob = parsedDob;
    if (typeof gender !== "undefined") updatedData.gender = gender;
    if (typeof notes !== "undefined")
      updatedData.notes = notes === "" ? null : notes;

    // ✅ If a new photo is uploaded, add photoUrl
    if (req.file) {
      updatedData.photoUrl = `/uploads/${req.file.filename}`;
    }

    console.log("📌 Final Updated Data:", updatedData);

    const updatedMember = await prisma.member.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    console.log("✅ Member Updated:", updatedMember);

    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("❌ Error updating member:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single member by ID with relationships
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: {
        spouse: true,
        children: true,
        parent: true,
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Ensure photoUrl is a full URL if available
    const updatedMember = {
      ...member,
      photoUrl: member.photoUrl
        ? `http://localhost:5000${member.photoUrl}`
        : null,
    };

    res.json(updatedMember);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Server error" });
  }
};
