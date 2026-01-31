const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/auth.middleware");
const {
  createUserByAdmin,
  getAllUsers
} = require("../controllers/user.controller");
const authorizePermission = require("../middleware/permission.middleware");
const { updateUser, deleteUser } = require("../controllers/user.controller");
const { getUserById } = require("../controllers/user.controller");



// Admin creates user
router.post(
  "/",
  protect,
  authorizePermission("user:create"),
  createUserByAdmin
);

router.get(
  "/",
  protect,
  authorizePermission("user:read"),
  getAllUsers
);

/**
 * UPDATE USER
 */
router.put(
  "/:id",
  protect,
  authorizePermission("user:update"),
  updateUser
);

/**
 * DELETE USER
 */
router.delete(
  "/:id",
  protect,
  authorizePermission("user:delete"),
  deleteUser
);
 
router.get(
  "/:id",
  protect,
  authorizePermission("user:read"),
  getUserById
);



module.exports = router;
