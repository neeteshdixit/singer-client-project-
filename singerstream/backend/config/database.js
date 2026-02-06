const { Pool } = require("pg");
require("dotenv").config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

// Use DATABASE_URL when provided (e.g., on hosted platforms), otherwise use individual DB_* env vars
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      // Ensure password is a string (pg expects a string for SASL auth)
      password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    };

// Helpful debug (avoid printing passwords)
console.log("DB config:", {
  usingConnectionString: !!process.env.DATABASE_URL,
  dbUser: poolConfig.user || null,
  dbHost: poolConfig.host || null,
  dbName: poolConfig.database || null,
  dbPort: poolConfig.port || null,
});

const pool = new Pool(poolConfig);

// Catch errors emitted by idle clients to avoid crashes
pool.on('error', (err) => {
  console.error('Unexpected DB error on idle client', err);
});

module.exports = pool;
