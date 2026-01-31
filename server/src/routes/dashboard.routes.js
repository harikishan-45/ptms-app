const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/permission.middleware");
const { getDashboardStats } = require("../controllers/dashboard.controller");

router.get(
  "/",
  protect,
  authorizePermission("dashboard:read"),
  getDashboardStats
);

module.exports = router;
