/*
  Warnings:

  - Made the column `intensity` on table `Submission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deviceSessionId` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_deviceSessionId_fkey";

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "intensity" SET NOT NULL,
ALTER COLUMN "deviceSessionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_deviceSessionId_fkey" FOREIGN KEY ("deviceSessionId") REFERENCES "DeviceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
