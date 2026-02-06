const jwt = require("jsonwebtoken");

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  if (header) return header;
  if (req.query && req.query.token) return req.query.token;
  return null;
}

function auth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ msg: "Invalid token" });
  }
}

module.exports = auth;
