const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🔐 PROTECT MIDDLEWARE
 * - Token verify karta hai
 * - req.user me required user data attach karta hai
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1️⃣ Token extract
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3️⃣ Fetch user (password exclude)
      const user = await User.findById(decoded.id)
        .select("-password")
        .populate("role"); // 🔥 role populate for permission system

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      /**
       * 4️⃣ Attach CLEAN user object to req
       * This is REQUIRED for permission middleware
       */
      req.user = {
        _id: user._id,
        role: user.role?._id || null,      // Role ObjectId
        roleName: user.role?.name || "employee", // Role name (admin/manager/etc)
        permissions: decoded.permissions || [],
        extraPermissions: user.extraPermissions || [],
        revokedPermissions: user.revokedPermissions || []
      };

      next(); // ✅ allowed
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleName)) {
      return res.status(403).json({
        message: `Role ${req.user.roleName} not allowed`
      });
    }
    next();
  };
};
