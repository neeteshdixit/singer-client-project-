CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin','fan')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  type VARCHAR(10) CHECK (type IN ('song','podcast','video')),
  file_path TEXT,
  thumbnail_url TEXT,
  description TEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views_count INT DEFAULT 0,
  admin_id INT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content_id INT REFERENCES content(id),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
