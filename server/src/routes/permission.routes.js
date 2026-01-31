const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/permission.middleware");

const {
  getAllPermissions
} = require("../controllers/permission.controller");

// 🔐 ADMIN ONLY
router.get(
  "/",
  protect,
  authorizePermission("role:read"),
  getAllPermissions
);

module.exports = router;
