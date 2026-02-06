const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function syncAdmin() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || null;

    if (!adminUsername || !adminPassword) {
      console.log('Admin sync skipped (ADMIN_USERNAME/ADMIN_PASSWORD not set).');
      return;
    }

    const existing = await pool.query(
      'SELECT id, username, email, role FROM users WHERE username=$1 OR email=$2',
      [adminUsername, adminEmail]
    );

    const hash = await bcrypt.hash(adminPassword, 10);

    if (!existing.rows.length) {
      await pool.query(
        "INSERT INTO users(username,email,password_hash,role) VALUES($1,$2,$3,'admin')",
        [adminUsername, adminEmail, hash]
      );
      console.log('Admin user created.');
    } else {
      await pool.query(
        "UPDATE users SET username=$1, email=$2, password_hash=$3, role='admin' WHERE id=$4",
        [adminUsername, adminEmail, hash, existing.rows[0].id]
      );
      console.log('Admin user updated.');
    }
  } catch (err) {
    console.error('Failed to sync admin:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

syncAdmin();
