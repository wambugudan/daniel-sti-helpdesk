/*
  Warnings:

  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `WorkRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bid_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "councilId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invite_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invite_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invite_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "id", "name") SELECT "email", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_WorkRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileURL" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deadline" DATETIME NOT NULL,
    "durationDays" INTEGER,
    CONSTRAINT "WorkRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkRequest" ("budget", "category", "createdAt", "description", "fileURL", "id", "title", "updatedAt", "userId") SELECT "budget", "category", "createdAt", "description", "fileURL", "id", "title", "updatedAt", "userId" FROM "WorkRequest";
DROP TABLE "WorkRequest";
ALTER TABLE "new_WorkRequest" RENAME TO "WorkRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
