CREATE TYPE "UserRole" AS ENUM ('USER', 'DOCTOR', 'ADMIN');

ALTER TABLE "user"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Existing accounts were already using the clinical workspace before roles existed.
UPDATE "user" SET "role" = 'DOCTOR';
