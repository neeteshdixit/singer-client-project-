const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const to = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL;
    if (!to) {
      return res.status(500).json({ msg: "Admin email not configured" });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({ msg: "SMTP not configured" });
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `SingerStream <${fromAddress}>`,
      to,
      replyTo: email,
      subject: `[SingerStream] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });

    res.json({ msg: "Message sent" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ msg: "Failed to send message" });
  }
});

module.exports = router;
