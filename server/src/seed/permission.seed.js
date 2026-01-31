const Permission = require("../models/Permission");

const permissions = [
  { key: "user:create", description: "Create users" },
  { key: "user:read", description: "View users" },
  { key: "user:update", description: "Update users" },
  { key: "user:delete", description: "Delete users" },

  { key: "role:create", description: "Create roles" },
  { key: "role:update", description: "Update roles" },

  { key: "project:create", description: "Create projects" },
  { key: "project:read", description: "View projects" },
  { key: "project:update", description: "Update projects" },
  { key: "project:delete", description: "Delete projects" },

  { key: "task:create", description: "Create tasks" },
  { key: "task:assign", description: "Assign tasks" },
  { key: "task:update", description: "Update tasks" },
  { key: "task:block", description: "Block tasks" },
  { key: "task:approve", description: "Approve tasks" }
];

const seedPermissions = async () => {
  for (const perm of permissions) {
    await Permission.updateOne(
      { key: perm.key },
      { $set: perm },
      { upsert: true }
    );
  }

  console.log("✅ Permissions seeded");
};

module.exports = seedPermissions;
