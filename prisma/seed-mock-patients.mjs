import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  const { rows } = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "session" WHERE "expiresAt" > CURRENT_TIMESTAMP) AS active_sessions
  `);

  if (rows[0].active_sessions === 0) {
    throw new Error("No active app session found. Sign in to the app before seeding mock patients.");
  }

  await client.query("BEGIN");
  const seedSql = await readFile(new URL("./seed-mock-patients.sql", import.meta.url), "utf8");
  await client.query(seedSql);

  const { rows: patientRows } = await client.query(`SELECT COUNT(*)::int AS count FROM "Patient" WHERE "patientNumber" LIKE 'MOCK-2026-%'`);
  const { rows: visitRows } = await client.query(`
      SELECT COUNT(*)::int AS count, COUNT(DISTINCT a."patientId")::int AS patients,
        MIN(per_patient.count)::int AS min_per_patient, MAX(per_patient.count)::int AS max_per_patient
      FROM "Appointment" a
      JOIN "Patient" p ON p."id" = a."patientId"
      CROSS JOIN LATERAL (
        SELECT COUNT(*)::int AS count FROM "Appointment" patient_appointment
        WHERE patient_appointment."patientId" = a."patientId"
          AND patient_appointment."id" LIKE 'mock_appt_%'
      ) per_patient
      WHERE p."patientNumber" LIKE 'MOCK-2026-%'
        AND a."id" LIKE 'mock_appt_%'
    `);
  const { rows: doctorRows } = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM "Doctor" d
      WHERE d."userId" = (
        SELECT "userId" FROM "session"
        WHERE "expiresAt" > CURRENT_TIMESTAMP
        ORDER BY "updatedAt" DESC LIMIT 1
      )
    `);

  if (patientRows[0].count !== 200 || visitRows[0].patients !== 200 || visitRows[0].count !== 401 || visitRows[0].min_per_patient < 1 || visitRows[0].max_per_patient > 3) {
    throw new Error(`Seed verification failed: ${patientRows[0].count} patients and ${visitRows[0].count} visits across ${visitRows[0].patients} patients.`);
  }

  await client.query("COMMIT");
  console.log(`Mock patient records present: ${patientRows[0].count}`);
  console.log(`Mock previous visits present: ${visitRows[0].count} across ${visitRows[0].patients} patients (${visitRows[0].min_per_patient}–${visitRows[0].max_per_patient} each)`);
  console.log(`Active-session doctor records linked: ${doctorRows[0].count}`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
