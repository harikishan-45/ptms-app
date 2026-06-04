const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "ptms_token";

const getCookieValue = (cookieHeader, cookieName) => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();
    if (name === cookieName) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1));
    }
  }

  return null;
};

const getTokenFromRequest = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }

  return getCookieValue(req.headers.cookie, COOKIE_NAME);
};

/**
 * PROTECT MIDDLEWARE
 */
exports.protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no session found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          select: "key",
        },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      _id: user._id,
      role: user.role?._id || null,
      roleName: user.role?.name || "employee",
      permissions: decoded.permissions || [],
      extraPermissions: user.extraPermissions || [],
      revokedPermissions: user.revokedPermissions || [],
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleName)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.roleName} not allowed`,
      });
    }

    next();
  };
};
