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
const permissionTestRoutes = require("./routes/permission.test.routes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173,https://ptms-frontend-tbg5.onrender.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/user-permissions", userPermissionRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/test-permission", permissionTestRoutes);

app.get("/", (req, res) => {
  res.send("PTMS API Running");
});

module.exports = app;
