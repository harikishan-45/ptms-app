const Role = require("../models/Role");
const Permission = require("../models/Permission");

/**
 * ✅ CREATE ROLE (ADMIN ONLY)
 */
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    let permissionIds = [];

    if (permissions?.length) {
      const perms = await Permission.find({ key: { $in: permissions } });
      permissionIds = perms.map(p => p._id);
    }

    const role = await Role.create({
      name,
      permissions: permissionIds,
      isSystemRole: false
    });

    res.status(201).json({
      message: "Role created successfully",
      role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📄 GET ALL ROLES (ADMIN)
 */
exports.getAllRoles = async (req, res) => {
  const roles = await Role.find().populate("permissions");
  res.json(roles);
};

/**
 * 🔄 UPDATE ROLE PERMISSIONS (ADMIN)
 * ❌ Admin role cannot be edited
 */
exports.updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.name === "admin") {
      return res.status(403).json({
        message: "Admin role cannot be modified"
      });
    }

    const perms = await Permission.find({ key: { $in: permissions } });
    role.permissions = perms.map(p => p._id);
    await role.save();

    res.json({
      message: "Role permissions updated",
      role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
