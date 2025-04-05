// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Set default schema
pool.on("connect", (client) => {
  client.query("SET search_path TO holmz_schema");
});

// 👇 Test the connection right away
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
  }
})();

export default pool;
