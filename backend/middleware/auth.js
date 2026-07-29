const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "hrms-secret-key-2024";

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "ERROR", message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ status: "ERROR", message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select('-password').populate('employee');

    if (!user || !user.isActive) {
      return res.status(401).json({ status: "ERROR", message: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "ERROR", message: "Invalid token" });
  }
}

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Required roles: " + roles.join(", ") });
    }
    next();
  };
};

module.exports = { auth, checkRole, JWT_SECRET };
