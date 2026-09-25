// Creates the `admins` table (if missing) and a default admin account.
// Run with:  bun scripts/seed-admin.mjs   (reads .env automatically)
// Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME, with dev defaults.
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const email = (process.env.ADMIN_EMAIL || "admin@ankoo.dev").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123";
const name = process.env.ADMIN_NAME || "Administrator";

await sql`CREATE TABLE IF NOT EXISTS admins (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
)`;

const passwordHash = await bcrypt.hash(password, 10);
const rows = await sql`
  INSERT INTO admins (name, email, password_hash)
  VALUES (${name}, ${email}, ${passwordHash})
  ON CONFLICT (email) DO NOTHING
  RETURNING id`;

if (rows.length) console.log(`Created default admin: ${email} (password: ${password})`);
else console.log(`Admin ${email} already exists — left unchanged.`);
console.log("done");
