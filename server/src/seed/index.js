require("dotenv").config();
const connectDB = require("../config/db");
const seedPermissions = require("./permission.seed");
const seedRoles = require("./role.seed");

const runSeed = async () => {
  await connectDB();
  await seedPermissions();
  await seedRoles();
  process.exit();
};

runSeed();
