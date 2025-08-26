/*
  Warnings:

  - Added the required column `updatedAt` to the `WorkRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "WorkRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkRequest" ("budget", "category", "createdAt", "description", "id", "title", "userId") SELECT "budget", "category", "createdAt", "description", "id", "title", "userId" FROM "WorkRequest";
DROP TABLE "WorkRequest";
ALTER TABLE "new_WorkRequest" RENAME TO "WorkRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
