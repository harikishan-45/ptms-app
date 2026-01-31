const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

exports.getDashboardStats = async (req, res) => {
  try {
    let stats = {};

    // 👑 ADMIN → system wide
    if (req.user.roleName === "admin") {
      stats.totalUsers = await User.countDocuments();
      stats.totalProjects = await Project.countDocuments();
      stats.totalTasks = await Task.countDocuments();

      stats.todoTasks = await Task.countDocuments({ status: "todo" });
      stats.inProgressTasks = await Task.countDocuments({ status: "in-progress" });
      stats.doneTasks = await Task.countDocuments({ status: "done" });
      stats.reviewTasks = await Task.countDocuments({ status: "review" });
      stats.blockedTasks = await Task.countDocuments({ status: "blocked" });
    }

    // 👨‍💼 MANAGER → own projects
    else if (req.user.roleName === "manager") {
      const projects = await Project.find({ manager: req.user._id });
      const projectIds = projects.map(p => p._id);

      stats.totalProjects = projectIds.length;
      stats.totalTasks = await Task.countDocuments({ project: { $in: projectIds } });

      stats.todoTasks = await Task.countDocuments({ project: { $in: projectIds }, status: "todo" });
      stats.inProgressTasks = await Task.countDocuments({ project: { $in: projectIds }, status: "in-progress" });
      stats.doneTasks = await Task.countDocuments({ project: { $in: projectIds }, status: "done" });
      stats.reviewTasks = await Task.countDocuments({ project: { $in: projectIds }, status: "review" });
      stats.blockedTasks = await Task.countDocuments({ project: { $in: projectIds }, status: "blocked" });
    }

    // 👨‍🔧 EMPLOYEE → only assigned tasks
    else if (req.user.roleName === "employee") {
      stats.totalTasks = await Task.countDocuments({ assignedTo: req.user._id });

      stats.todoTasks = await Task.countDocuments({ assignedTo: req.user._id, status: "todo" });
      stats.inProgressTasks = await Task.countDocuments({ assignedTo: req.user._id, status: "in-progress" });
      stats.doneTasks = await Task.countDocuments({ assignedTo: req.user._id, status: "done" });
      stats.reviewTasks = await Task.countDocuments({ assignedTo: req.user._id, status: "review" });
      stats.blockedTasks = await Task.countDocuments({ assignedTo: req.user._id, status: "blocked" });
    }

    res.json(stats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
