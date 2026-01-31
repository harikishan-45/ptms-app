const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const authorizePermission = require("../middleware/permission.middleware");
const { addCommentToTask } = require("../controllers/task.controller");


const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  changeTaskStatus,
  blockTask,
  unblockTask,
  assignTask,
  approveTask
} = require("../controllers/task.controller");

/**
 * CREATE TASK
 */
router.post(
  "/",
  protect,
  authorizePermission("task:create"),
  createTask
);

/**
 * GET TASKS
 */
router.get(
  "/",
  protect,
  authorizePermission("task:read"),
  getTasks
);

/**
 * GET TASK BY ID
 */
router.get(
  "/:id",
  protect,
  authorizePermission("task:read"),
  getTaskById
);

/**
 * UPDATE TASK STATUS
 */
router.put(
  "/:id/status",
  protect,
  authorizePermission("task:update"),
  updateTaskStatus
);

router.patch(
  "/:id/status",
  protect,
  authorizePermission("task:update"),
  changeTaskStatus
);

/**
 * BLOCK / UNBLOCK TASK
 */
router.patch(
  "/:id/block",
  protect,
  authorizePermission("task:block"),
  blockTask
);

router.patch(
  "/:id/unblock",
  protect,
  authorizePermission("task:block"),
  unblockTask
);

/**
 * ASSIGN TASK
 */
router.put(
  "/:id/assign",
  protect,
  authorizePermission("task:assign"),
  assignTask
);

/**
 * APPROVE TASK
 */
router.put(
  "/:id/approve",
  protect,
  authorizePermission("task:approve"),
  approveTask
);

//route for comment
router.post(
  "/:id/comments",
  protect,
  authorizePermission("task:comment"),
  addCommentToTask
);


module.exports = router;
