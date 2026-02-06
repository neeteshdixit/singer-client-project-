const express = require("express");
const db = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id=$1",
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("User profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/me", auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username && !email) {
      return res.status(400).json({ msg: "Nothing to update" });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (username) {
      fields.push(`username=$${idx++}`);
      values.push(username);
    }
    if (email) {
      fields.push(`email=$${idx++}`);
      values.push(email);
    }

    values.push(req.user.id);

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id=$${idx} RETURNING id, username, email, role, created_at`;
    const result = await db.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err && err.code === "23505") {
      return res.status(400).json({ msg: "Username or email already in use" });
    }
    console.error("User update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
