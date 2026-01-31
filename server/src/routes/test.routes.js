const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/auth.middleware");


// only for devlopment testing
router.get(
  "/manager",
  protect,
  authorizeRoles("admin" , "manager"),
  (req, res) => {
    res.json({
      message: "Welcome ",
      user: req.user
    });
  }
);

module.exports = router;
