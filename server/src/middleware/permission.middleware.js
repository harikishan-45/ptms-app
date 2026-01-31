const Role = require("../models/Role");
const Permission = require("../models/Permission");

const authorizePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // 1️⃣ Admin = always allowed
      if (user.roleName === "admin") {
        return next();
      }

      // 2️⃣ Load role with permissions
      const role = await Role.findById(user.role).populate("permissions");

      if (!role) {
        return res.status(403).json({
          message: "Role not found"
        });
      }

      // 3️⃣ Role permissions
      let permissions = role.permissions.map(p => p.key);

      // 4️⃣ Extra permissions (user-level grant)
      if (user.extraPermissions?.length) {
        const extra = await Permission.find({
          _id: { $in: user.extraPermissions }
        });
        permissions.push(...extra.map(p => p.key));
      }

      // 5️⃣ Revoked permissions (user-level revoke)
      if (user.revokedPermissions?.length) {
        const revoked = await Permission.find({
          _id: { $in: user.revokedPermissions }
        });
        const revokedKeys = revoked.map(p => p.key);
        permissions = permissions.filter(p => !revokedKeys.includes(p));
      }

      // 6️⃣ Final check
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          message: "Permission denied"
        });
      }

      next();

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = authorizePermission;


