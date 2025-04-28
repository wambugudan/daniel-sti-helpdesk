/*
  Warnings:

  - You are about to drop the `SubmissionFeedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubmissionFeedback";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SubmissionMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileURL" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubmissionMessage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
