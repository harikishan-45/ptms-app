const Role = require("../models/Role");
const Permission = require("../models/Permission");

const seedRoles = async () => {
  const allPermissions = await Permission.find();

  const adminRole = {
    name: "admin",
    permissions: allPermissions.map(p => p._id),
    isSystemRole: true
  };

  const managerPermissions = allPermissions.filter(p =>
    p.key.startsWith("project") || p.key.startsWith("task")
  );

  const managerRole = {
    name: "manager",
    permissions: managerPermissions.map(p => p._id),
    isSystemRole: true
  };

  const employeePermissions = allPermissions.filter(p =>
    p.key === "task:update"
  );

  const employeeRole = {
    name: "employee",
    permissions: employeePermissions.map(p => p._id),
    isSystemRole: true
  };

  await Role.updateOne({ name: "admin" }, adminRole, { upsert: true });
  await Role.updateOne({ name: "manager" }, managerRole, { upsert: true });
  await Role.updateOne({ name: "employee" }, employeeRole, { upsert: true });

  console.log("✅ Roles seeded");
};

module.exports = seedRoles;
