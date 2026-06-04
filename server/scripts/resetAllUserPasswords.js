require("../src/config/env");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const connectDB = require("../src/config/db");

const TARGET_PASSWORD = "Admin@123";

const run = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TARGET_PASSWORD, salt);

    const result = await User.updateMany(
      {},
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    console.log(
      `Updated ${result.modifiedCount || 0} of ${result.matchedCount || 0} users to the new password.`
    );
  } catch (error) {
    console.error("Password reset script failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
