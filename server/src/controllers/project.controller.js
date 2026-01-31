const Project = require("../models/Project");
const Task = require("../models/Task");

// CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const { name, description, manager } = req.body;
    //name required
    if (!name) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }
    let projectManager;
    //if admin -> manager comes from body 
    if (req.user.roleName === "admin") {
      if (!manager) {
        return res.status(400).json({
          mesaage: "Manager is required"
        });
      }
      projectManager = manager;
    }
    //if manager -> auto assign himself 
    else if (req.user.roleName === "manager") {
      projectManager = req.user._id;
    }
    const project = await Project.create({
      name,
      description,
      manager:projectManager,
      createdBy: req.user._id
    });
    res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROJECTS
exports.getProjects = async (req, res) => {
  try {
    let projects;

    // 👑 ADMIN → all projects
    if (req.user.roleName === "admin") {
      projects = await Project.find()
        .populate("manager", "name email")
        .populate("createdBy", "name email");
    }

    // 👨‍💼 MANAGER → own projects
    else if (req.user.roleName === "manager") {
      projects = await Project.find({ manager: req.user._id })
        .populate("manager", "name email")
        .populate("createdBy", "name email");
    }

    // 🚫 EMPLOYEE
    else {
      return res.status(403).json({
        message: "Not authorized to view projects"
      });
    }

    res.json({
      count: projects.length,
      projects
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROJECT TASKS
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json({
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.manager = req.body.manager || project.manager;

    await project.save();

    res.json({
      message: "Project updated successfully",
      project
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
