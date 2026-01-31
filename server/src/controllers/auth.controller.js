const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email }).populate("role");
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * LOGIN USER
 */
// exports.login = async (req, res) => {
//   try {
//     // console.log(req);
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password required" });
//     }

//     const user = await User.findOne({ email }).populate("role");

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 🔥 ROLE JWT ME ADD KAR RAHE HAIN
//     const token = jwt.sign(
//       {
//         id: user._id,
//         roleId: user.role._id,
//         roleName: user.role.name,
//         permissions: user.role.permissions
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );
//     // console.log(token);


//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         roleId: user.role._id,
//         roleName: user.role.name,
//         permissions: user.role.permissions
//       }
//     });


//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // role + permissions populate
    const user = await User.findOne({ email })
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          select: "key"
        }
      });

    // extract permission KEYS
    const permissionKeys = user.role.permissions.map(
      (p) => p.key
    );

    // JWT
    const token = jwt.sign(
      {
        id: user._id,
        roleId: user.role._id,
        roleName: user.role.name,
        permissions: permissionKeys
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roleId: user.role._id,
        roleName: user.role.name,
        permissions: permissionKeys
      }
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
