const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/permission.middleware");

const {
  grantPermission,
  revokePermission,
  getUserPermissions
} = require("../controllers/user.permission.controller");

// Admin only
router.post(
  "/:userId/grant",
  protect,
  authorizePermission("user:update"),
  grantPermission
);

router.post(
  "/:userId/revoke",
  protect,
  authorizePermission("user:update"),
  revokePermission
);

router.get(
  "/:userId",
  protect,
  authorizePermission("user:read"),
  getUserPermissions
);

module.exports = router;
