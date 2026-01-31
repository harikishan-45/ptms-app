const User = require("../models/User");
const Role = require("../models/Role");

exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔴 Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 🔥 FIND ROLE BY NAME (IMPORTANT FIX)
    const roleDoc = await Role.findOne({ name: role });

    if (!roleDoc) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    // 🔐 Manager restriction
    if (
      req.user.roleName === "manager" &&
      roleDoc.name !== "employee"
    ) {
      return res.status(403).json({
        message: "Manager can create only employees"
      });
    }

    // ❌ Duplicate user check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password,
      role: roleDoc._id // store ObjectId internally
    });

    res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password")
    .populate("role", "name");

  res.json({
    count: users.length,
    users
  });
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manager safety
    if (
      req.user.roleName === "manager" &&
      role &&
      role !== "employee"
    ) {
      return res.status(403).json({
        message: "Manager can update only employees"
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = roleDoc._id;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manager safety
    if (req.user.roleName === "manager") {
      const roleDoc = await Role.findById(user.role);
      if (roleDoc.name !== "employee") {
        return res.status(403).json({
          message: "Manager can delete only employees"
        });
      }
    }

    await user.deleteOne();

    res.json({
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")
      .populate("role", "name");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🔐 Manager can only view employees
    if (
      req.user.roleName === "manager" &&
      user.role.name !== "employee"
    ) {
      return res.status(403).json({
        message: "Not allowed to view this user"
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
