CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
CREATE TYPE "AppointmentSource" AS ENUM ('ONLINE', 'OFFLINE');
ALTER TYPE "UserRole" ADD VALUE 'ASSISTANT';

ALTER TABLE "Patient"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "heightCm" DECIMAL(5,2),
  ADD COLUMN "weightKg" DECIMAL(6,2),
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "isRegistered" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Prescription" ADD COLUMN "bmi" DECIMAL(5,2);

ALTER TABLE "Appointment"
  ADD COLUMN "status" "AppointmentStatus" NOT NULL DEFAULT 'ACCEPTED',
  ADD COLUMN "source" "AppointmentSource" NOT NULL DEFAULT 'OFFLINE',
  ADD COLUMN "acceptedAt" TIMESTAMPTZ(3),
  ADD COLUMN "serialNumber" INTEGER,
  ADD COLUMN "requestedByUserId" TEXT;
CREATE INDEX "Appointment_doctorId_status_createdAt_idx" ON "Appointment"("doctorId", "status", "createdAt");

CREATE TABLE "DoctorSchedule" (
  "id" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "slotMinutes" INTEGER NOT NULL DEFAULT 20,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DoctorSchedule_doctorId_weekday_key" ON "DoctorSchedule"("doctorId", "weekday");
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
