import "dotenv/config";
import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Usage: npm run db:make-admin -- existing-account@email.com");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const pool = new pg.Pool({ connectionString });
try {
  const result = await pool.query(
    'UPDATE "user" SET "role" = \'ADMIN\', "updatedAt" = CURRENT_TIMESTAMP WHERE LOWER("email") = $1 RETURNING "name", "email"',
    [email],
  );
  if (!result.rowCount) throw new Error(`No account found for ${email}. Register it first, then run this command.`);
  console.log(`Granted admin access to ${result.rows[0].name} (${result.rows[0].email}).`);
} finally {
  await pool.end();
}
