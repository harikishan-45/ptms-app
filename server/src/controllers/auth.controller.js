const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const DEFAULT_ROLE_NAME = "employee";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "ptms_token";

const populateUserForAuth = async (userId) => {
  return User.findById(userId)
    .select("-password")
    .populate({
      path: "role",
      populate: {
        path: "permissions",
        select: "key",
      },
    });
};

const buildAuthPayload = (user) => {
  const permissions = Array.isArray(user.role?.permissions)
    ? user.role.permissions.map((permission) => permission.key).filter(Boolean)
    : [];

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    roleId: user.role?._id ? user.role._id.toString() : null,
    roleName: user.role?.name || null,
    permissions,
  };
};

const parseDurationToMs = (value) => {
  if (!value) {
    return 24 * 60 * 60 * 1000;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!match) {
    return 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "s") return amount * 1000;
  if (unit === "m") return amount * 60 * 1000;
  if (unit === "h") return amount * 60 * 60 * 1000;
  return amount * 24 * 60 * 60 * 1000;
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = (process.env.COOKIE_SAMESITE || (isProduction ? "none" : "lax")).toLowerCase();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === "true"
      : isProduction,
    sameSite: sameSite === "none" ? "none" : sameSite,
    path: "/",
    maxAge: parseDurationToMs(process.env.JWT_EXPIRES_IN || "1d"),
  };

  if (process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  return cookieOptions;
};

const signTokenForUser = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: payload.permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const sendAuthResponse = async (res, statusCode, message, user) => {
  const authUser = buildAuthPayload(user);
  const token = signTokenForUser(authUser);

  res.cookie(COOKIE_NAME, token, getCookieOptions());

  return res.status(statusCode).json({
    success: true,
    message,
    user: authUser,
    data: {
      user: authUser,
    },
  });
};

const sendClearCookie = (res) => {
  const clearOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === "true"
      : process.env.NODE_ENV === "production",
    sameSite:
      (process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "none" : "lax")).toLowerCase() ===
      "none"
        ? "none"
        : (process.env.COOKIE_SAMESITE || "lax").toLowerCase(),
    path: "/",
  };

  if (process.env.COOKIE_DOMAIN) {
    clearOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.clearCookie(COOKIE_NAME, clearOptions);
};

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const roleName = (role || DEFAULT_ROLE_NAME).toLowerCase();
    const roleDoc = await Role.findOne({ name: roleName });

    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: `Role "${roleName}" not found. Please seed roles before registering users.`,
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: roleDoc._id,
    });

    const authUser = await populateUserForAuth(user._id);

    return sendAuthResponse(res, 201, "User registered successfully", authUser);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail }).populate({
      path: "role",
      populate: {
        path: "permissions",
        select: "key",
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    if (!user.role) {
      const defaultRole = await Role.findOne({ name: DEFAULT_ROLE_NAME });

      if (!defaultRole) {
        return res.status(500).json({
          success: false,
          message: `Default role "${DEFAULT_ROLE_NAME}" not found. Seed roles first.`,
        });
      }

      user.role = defaultRole._id;
      await user.save();
      user = await populateUserForAuth(user._id);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return sendAuthResponse(res, 200, "Login successful", user);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * CURRENT SESSION
 */
exports.me = async (req, res) => {
  try {
    const user = await populateUserForAuth(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = buildAuthPayload(user);

    return res.json({
      success: true,
      user: payload,
      data: {
        user: payload,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * LOGOUT
 */
exports.logout = async (req, res) => {
  sendClearCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
