const express = require("express");
const db = require("../config/database");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const fs = require("fs");
const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
}

router.post("/", auth, requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const { title, type, description } = req.body;
    if (!title || !type) {
      return res.status(400).json({ msg: "Title and type are required" });
    }
    if (!req.file) {
      return res.status(400).json({ msg: "File is required" });
    }

    const result = await db.query(
      "INSERT INTO content(title,type,file_path,description,admin_id) VALUES($1,$2,$3,$4,$5) RETURNING id,title,type,description,thumbnail_url,upload_date,views_count",
      [title, type, req.file.path, description || null, req.user.id]
    );

    res.json({ msg: "Uploaded", content: result.rows[0] });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const { search, type, sort = "upload_date", limit = "50" } = req.query;
    const role = req.user?.role;
    const enforcedType = role === "fan" ? "song" : type;
    const values = [];
    const where = [];

    if (search) {
      values.push(`%${search}%`, `%${search}%`);
      where.push(`(title ILIKE $${values.length - 1} OR description ILIKE $${values.length})`);
    }

    if (enforcedType) {
      values.push(enforcedType);
      where.push(`type = $${values.length}`);
    }

    const sortMap = {
      upload_date: "upload_date",
      views_count: "views_count",
      title: "title"
    };
    const sortBy = sortMap[sort] || "upload_date";
    const sortDir = sortBy === "title" ? "ASC" : "DESC";

    let query =
      "SELECT id,title,type,description,thumbnail_url,upload_date,views_count FROM content";
    if (where.length) {
      query += ` WHERE ${where.join(" AND ")}`;
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 100);
    query += ` ORDER BY ${sortBy} ${sortDir} LIMIT ${parsedLimit}`;

    const data = await db.query(query, values);
    res.json({ content: data.rows });
  } catch (err) {
    console.error("Content list error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/stream/:id", auth, async (req, res) => {
  try {
    const result = await db.query("SELECT file_path, type FROM content WHERE id=$1", [
      req.params.id
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ msg: "Not found" });
    }

    const { file_path: filePath, type } = result.rows[0];
    if (req.user?.role === "fan" && type !== "song") {
      return res.status(403).json({ msg: "Fans can only stream songs" });
    }
    const stat = fs.statSync(filePath);

    db.query("UPDATE content SET views_count = views_count + 1 WHERE id=$1", [
      req.params.id
    ]).catch(() => {});

    res.writeHead(200, {
      "Content-Length": stat.size
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id,title,type,description,thumbnail_url,upload_date,views_count FROM content WHERE id=$1",
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ msg: "Not found" });
    }

    const content = result.rows[0];
    if (req.user?.role === "fan" && content.type !== "song") {
      return res.status(403).json({ msg: "Fans can only view songs" });
    }
    content.file_url = `/api/content/stream/${content.id}`;
    res.json(content);
  } catch (err) {
    console.error("Content detail error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const existing = await db.query("SELECT file_path FROM content WHERE id=$1", [
      req.params.id
    ]);
    if (!existing.rows.length) {
      return res.status(404).json({ msg: "Not found" });
    }

    await db.query("DELETE FROM content WHERE id=$1", [req.params.id]);
    const filePath = existing.rows[0].file_path;
    if (filePath) {
      fs.unlink(filePath, () => {});
    }

    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
