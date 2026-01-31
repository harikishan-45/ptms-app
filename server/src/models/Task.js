const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "blocked", "review", "done"],
      default: "todo"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    dueDate: {
      type: Date
    },

    estimatedTime: {
      type: Number // hours
    },

    actualTime: {
      type: Number // hours
    },

    // 🔥 DEPENDENCY SECTION
    dependencyType: {
      type: String,
      enum: ["internal", "external", "approval"]
    },

    dependencyDescription: {
      type: String
    },

    blockedByTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },

    blockedByExternal: {
      type: String
    },
    // check point
    comments: [
      {
        text: {
          type: String,
          required: true
        },
        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        roleName: {
          type: String
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]

  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
