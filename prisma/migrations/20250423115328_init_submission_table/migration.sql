/*
  Warnings:

  - You are about to drop the column `submissionFileURL` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `submissionMessage` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Bid` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "fileURL" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bidId" TEXT NOT NULL,
    CONSTRAINT "Submission_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bid_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bid" ("amount", "createdAt", "id", "message", "userId", "workRequestId") SELECT "amount", "createdAt", "id", "message", "userId", "workRequestId" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_bidId_key" ON "Submission"("bidId");
