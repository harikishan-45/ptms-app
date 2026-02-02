const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Find user with role + permissions
    const user = await User.findOne({ email }).populate({
      path: "role",
      populate: {
        path: "permissions",
        select: "key",
      },
    });

    // 3️⃣ User not found
    if (!user || !user.role) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Password match check (YOU WERE MISSING THIS ❗)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 5️⃣ Extract permission keys
    const permissionKeys = user.role.permissions.map((p) => p.key);

    // 6️⃣ Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        roleId: user.role._id,
        roleName: user.role.name,
        permissions: permissionKeys,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roleId: user.role._id,
        roleName: user.role.name,
        permissions: permissionKeys,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
