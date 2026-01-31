const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/permission.middleware");
const {
  createRole,
  getAllRoles,
  updateRolePermissions
} = require("../controllers/role.controller");

// 🔐 Admin only
router.post(
  "/",
  protect,
  authorizePermission("role:create"),
  createRole
);

router.get(
  "/",
  protect,
  authorizePermission("role:read"),
  getAllRoles
);


router.put(
  "/:roleId",
  protect,
  authorizePermission("role:update"),
  updateRolePermissions
);

module.exports = router;
