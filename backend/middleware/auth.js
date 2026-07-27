const { verifyToken } = require("../utils/jwtUtils");

function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  console.log("Authorization Header:", authHeader); 

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "ERROR", message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ status: "ERROR", message: "Invalid or expired token" });
  }

  req.user = decoded; // attach decoded payload for route handlers
  next();
}

module.exports = auth;
