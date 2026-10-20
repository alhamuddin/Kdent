DROP INDEX IF EXISTS "DoctorSchedule_doctorId_weekday_key";

ALTER TABLE "DoctorSchedule"
  ADD COLUMN "clinicName" TEXT NOT NULL DEFAULT 'Main clinic',
  ADD COLUMN "clinicAddress" TEXT;

CREATE INDEX "DoctorSchedule_doctorId_weekday_enabled_idx"
  ON "DoctorSchedule"("doctorId", "weekday", "enabled");

ALTER TABLE "Appointment"
  ADD COLUMN "clinicName" TEXT,
  ADD COLUMN "clinicAddress" TEXT;
