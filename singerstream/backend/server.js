require("dotenv").config({ path: require('path').resolve(__dirname, '..', '.env') });   // MUST be first (loads root .env when running from /backend)

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const contentRoutes = require("./routes/content");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

// Serve frontend static files
const path = require('path');
const frontendDir = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Fallback to index.html for SPA routes
app.get('*', (req, res, next) => {
  // Don't override API routes
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Global error handlers to prevent unexpected process exit during development
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.listen(3000, () => console.log("Server running on 3000"));
