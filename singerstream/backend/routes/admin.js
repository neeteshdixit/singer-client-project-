const express = require("express");
const db = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
}

router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Admin users list error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/users/:id/role", auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["admin", "fan"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const targetId = parseInt(req.params.id, 10);
    if (targetId === req.user.id && role !== "admin") {
      return res.status(400).json({ msg: "You cannot remove your own admin role" });
    }

    const result = await db.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role, created_at",
      [role, targetId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Admin role update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
