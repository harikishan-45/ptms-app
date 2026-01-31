const express = require("express");
const router = express.Router();


const { getProjectTasks } = require("../controllers/project.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");
const { createProject, getProjects , updateProject  } = require("../controllers/project.controller");
const authorizePermission = require("../middleware/permission.middleware");

router.post(
  "/",
  protect,
  authorizePermission("project:create"),
  createProject
);

router.get(
  "/",
  protect,
  authorizePermission("project:read"),
  getProjects
);

router.put(
  "/:id",
  protect,
  authorizePermission("project:update"),
  updateProject
);

router.get(
  "/:id/tasks",
  protect,
  authorizePermission("task:read"),
  getProjectTasks
);

module.exports = router;
