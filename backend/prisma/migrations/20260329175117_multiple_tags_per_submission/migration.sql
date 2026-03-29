/*
  Warnings:

  - You are about to drop the column `tagId` on the `Submission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_tagId_fkey";

-- DropIndex
DROP INDEX "Submission_tagId_idx";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "tagId";

-- CreateTable
CREATE TABLE "SubmissionTag" (
    "submissionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "SubmissionTag_pkey" PRIMARY KEY ("submissionId","tagId")
);

-- CreateIndex
CREATE INDEX "SubmissionTag_tagId_idx" ON "SubmissionTag"("tagId");

-- AddForeignKey
ALTER TABLE "SubmissionTag" ADD CONSTRAINT "SubmissionTag_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionTag" ADD CONSTRAINT "SubmissionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
