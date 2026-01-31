const Task = require("../models/Task");
const Project = require("../models/Project");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dependencyType,
      dependencyDescription,
      blockedByTask,
      blockedByExternal
    } = req.body;

    // Basic validation
    if (!title || !project || !assignedTo) {
      return res.status(400).json({
        message: "Title, project and assigned user are required"
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      dependencyType,
      dependencyDescription,
      blockedByTask,
      blockedByExternal,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// // GET TASKS (Role-based)
// // GET TASKS (Role-based)
// exports.getTasks = async (req, res) => {
//   try {
//     let tasks;

//     // 👑 ADMIN → all tasks
//     if (req.user.roleName === "admin") {
//       tasks = await Task.find()
//         .populate("project", "name status")
//         .populate("assignedTo", "name email")
//         .populate("createdBy", "name email");
//     }

//     // 👨‍💼 MANAGER → tasks of own projects
//     else if (req.user.roleName === "manager") {
//       tasks = await Task.find()
//         .populate({
//           path: "project",
//           match: { manager: req.user._id },
//           select: "name status manager"
//         })
//         .populate("assignedTo", "name email")
//         .populate("createdBy", "name email");

//       // remove tasks not belonging to manager projects
//       tasks = tasks.filter(t => t.project !== null);
//     }

//     // 👨‍🔧 EMPLOYEE → only assigned tasks
//     else if (req.user.roleName === "employee") {
//       tasks = await Task.find({ assignedTo: req.user._id })
//         .populate("project", "name status")
//         .populate("assignedTo", "name email")
//         .populate("createdBy", "name email");
//     }

//     else {
//       return res.status(403).json({
//         message: "Not authorized to view tasks"
//       });
//     }

//     res.json({
//       count: tasks.length,
//       tasks
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.getTasks = async (req, res) => {
  try {
    let tasks = [];

    // ADMIN → all tasks
    if (req.user.roleName === "admin") {
      tasks = await Task.find()
        .populate("project", "name status manager")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");
    }

    // MANAGER → tasks of their projects
    else if (req.user.roleName === "manager") {
      tasks = await Task.find()
        .populate({
          path: "project",
          match: { manager: req.user._id },
          select: "name status manager"
        })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");

      tasks = tasks.filter(t => t.project !== null);
    }

    // EMPLOYEE / HR / ANY ROLE WITH task:read
    else {
      tasks = await Task.find({
        $or: [
          { assignedTo: req.user._id },
          { createdBy: req.user._id }
        ]
      })
        .populate("project", "name status")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");
    }

    res.json({
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE TASK STATUS
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // ✅ Employee sirf apna task update kare
    if (
      req.user.roleName === "employee" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not allowed to update this task"
      });
    }

    task.status = status;
    await task.save();

    res.json({
      message: "Task status updated successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changeTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ❌ Blocked task rule
    if (task.status === "blocked" && status === "in-progress") {
      return res.status(400).json({
        message: "Blocked task cannot move to In Progress"
      });
    }

    // ❌ Internal dependency rule
    if (status === "in-progress" && task.dependencyType === "internal") {
      if (!task.blockedByTask) {
        return res.status(400).json({
          message: "Internal dependency task not linked"
        });
      }

      const dependencyTask = await Task.findById(task.blockedByTask);
      if (!dependencyTask || dependencyTask.status !== "done") {
        return res.status(400).json({
          message: "Dependent task is not completed yet"
        });
      }
    }

    // 🔥 APPROVAL DEPENDENCY RULES
    if (task.dependencyType === "approval") {

      // Employee cannot approve
      if (status === "done" && req.user.roleName === "employee") {
        return res.status(403).json({
          message: "Employee cannot approve task"
        });
      }

      // Employee can only move to review
      if (
        status === "review" &&
        req.user.roleName === "employee"
      ) {
        task.status = "review";
        await task.save();
        return res.json({
          message: "Task sent for approval",
          task
        });
      }

      // Manager/Admin approval
      if (
        status === "done" &&
        (req.user.roleName === "manager" || req.user.roleName === "admin")
      ) {
        task.status = "done";
        await task.save();
        return res.json({
          message: "Task approved and completed",
          task
        });
      }

      return res.status(400).json({
        message: "Invalid approval flow action"
      });
    }

    // ✅ Default status update
    task.status = status;
    await task.save();

    res.json({
      message: "Task status updated successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// BLOCK TASK WITH REASON
exports.blockTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { dependencyType, dependencyDescription } = req.body;

    // 1️⃣ Validate input
    if (!dependencyType || !dependencyDescription) {
      return res.status(400).json({
        message: "Dependency type and reason are required to block task"
      });
    }

    // 2️⃣ Find task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // 3️⃣ Block task
    task.status = "blocked";
    task.dependencyType = dependencyType;
    task.dependencyDescription = dependencyDescription;

    await task.save();

    res.json({
      message: "Task blocked successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNBLOCK TASK
exports.unblockTask = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // 2️⃣ Check if task is actually blocked
    if (task.status !== "blocked") {
      return res.status(400).json({
        message: "Only blocked tasks can be unblocked"
      });
    }

    // 3️⃣ Unblock task
    task.status = "todo";

    // Optional: clear dependency info
    task.dependencyType = undefined;
    task.dependencyDescription = undefined;
    task.blockedByTask = undefined;
    task.blockedByExternal = undefined;

    await task.save();

    res.json({
      message: "Task unblocked successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE TASK DETAIL
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("project", "name")
      .populate("comments.commentedBy", "name email");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//assign atask
exports.assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.assignedTo = assignedTo;
    await task.save();

    await task.populate("assignedTo", "name role");

    res.json({
      message: "Task assigned successfully",
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = "approved";
    await task.save();

    res.json({
      message: "Task approved successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//new function
exports.addCommentToTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.comments.push({
      text,
      commentedBy: req.user._id,
      roleName: req.user.roleName
    });

    await task.save();

    res.json({
      message: "Comment added successfully",
      comments: task.comments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
