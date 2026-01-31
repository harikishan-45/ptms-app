const User = require("../models/User");
const Permission = require("../models/Permission");

/**
 * ➕ GRANT EXTRA PERMISSION TO USER (ADMIN)
 */
exports.grantPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissionKey } = req.body;

    const permission = await Permission.findOne({ key: permissionKey });
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already granted?
    if (user.extraPermissions.includes(permission._id)) {
      return res.status(400).json({ message: "Permission already granted" });
    }

    // Remove from revoked if present
    user.revokedPermissions = user.revokedPermissions.filter(
      p => p.toString() !== permission._id.toString()
    );

    user.extraPermissions.push(permission._id);
    await user.save();

    res.json({
      message: "Permission granted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ➖ REVOKE PERMISSION FROM USER (ADMIN)
 */
exports.revokePermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissionKey } = req.body;

    const permission = await Permission.findOne({ key: permissionKey });
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from extraPermissions if exists
    user.extraPermissions = user.extraPermissions.filter(
      p => p.toString() !== permission._id.toString()
    );

    // Add to revokedPermissions if not already
    if (!user.revokedPermissions.includes(permission._id)) {
      user.revokedPermissions.push(permission._id);
    }

    await user.save();

    res.json({
      message: "Permission revoked successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📄 GET USER EFFECTIVE PERMISSIONS (ADMIN)
 */
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: "role",
        populate: { path: "permissions" }
      })
      .populate("extraPermissions")
      .populate("revokedPermissions");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Admin shortcut
    if (user.roleName === "admin") {
      return res.json({
        effectivePermissions: ["ALL"]
      });
    }

    let rolePermissions = user.role?.permissions.map(p => p.key) || [];
    let extra = user.extraPermissions.map(p => p.key);
    let revoked = user.revokedPermissions.map(p => p.key);

    let effectivePermissions = rolePermissions
      .concat(extra)
      .filter(p => !revoked.includes(p));

    res.json({
      role: user.role?.name,
      rolePermissions,
      extraPermissions: extra,
      revokedPermissions: revoked,
      effectivePermissions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
