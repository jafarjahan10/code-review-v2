/*
  Warnings:

  - Added the required column `endTime` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add column with a temporary default
ALTER TABLE "Candidate" ADD COLUMN "endTime" TIMESTAMP(3);

-- Update existing records: set endTime to 4 hours after scheduledTime
UPDATE "Candidate" SET "endTime" = "scheduledTime" + INTERVAL '4 hours' WHERE "endTime" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "Candidate" ALTER COLUMN "endTime" SET NOT NULL;
