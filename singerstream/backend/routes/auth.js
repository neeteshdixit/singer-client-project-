const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: "Username and password required" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users(username,email,password_hash,role) VALUES($1,$2,$3,'fan') RETURNING id, username, email, role",
      [username, email || null, hash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    // handle unique constraint on email or username
    if (err && err.code === "23505") {
      return res.status(400).json({ msg: "User already registered" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: "Username and password required" });
    }

    const userResult = await db.query(
      "SELECT id, username, email, password_hash, role FROM users WHERE username=$1",
      [username]
    );

    if (!userResult.rows.length) {
      return res.status(400).json({ msg: "Invalid username or password" });
    }

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ msg: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/verify", async (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      valid: true,
      user: { id: decoded.id, username: decoded.username, role: decoded.role }
    });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
});

module.exports = router;
