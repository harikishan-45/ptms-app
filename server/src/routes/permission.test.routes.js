const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/permission.middleware");

router.get(
  "/project-create-test",
  protect,
  authorizePermission("project:create"),
  (req, res) => {
    res.json({ message: "Permission check passed ✅" });
  }
);

module.exports = router;
