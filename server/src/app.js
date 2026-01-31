const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const roleRoutes = require("./routes/role.routes");
const userPermissionRoutes = require("./routes/user.permission.routes");
const permissionRoutes = require("./routes/permission.routes");




// 🔥 ADD THIS LINE
const permissionTestRoutes = require("./routes/permission.test.routes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ptms-frontend-tbg5.onrender.com/"
  ],
  credentials: true,
}));
app.use(express.json());

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/user-permissions", userPermissionRoutes);
app.use("/api/permissions", permissionRoutes);


// 🔥 PERMISSION TEST ROUTE (ADD HERE)
app.use("/api/test-permission", permissionTestRoutes);

app.get("/", (req, res) => {
  res.send("PTMS API Running");
});

module.exports = app;
