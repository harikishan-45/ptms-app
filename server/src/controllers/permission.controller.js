const Permission = require("../models/Permission");

/**
 * 📄 GET ALL PERMISSIONS (ADMIN)
 */
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort("key");
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
