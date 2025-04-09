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
    "deadline" DATETIME NOT NULL,
    "durationDays" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "acceptedBidId" TEXT,
    CONSTRAINT "WorkRequest_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "Bid" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkRequest" ("budget", "category", "createdAt", "deadline", "description", "durationDays", "fileURL", "id", "title", "updatedAt", "userId") SELECT "budget", "category", "createdAt", "deadline", "description", "durationDays", "fileURL", "id", "title", "updatedAt", "userId" FROM "WorkRequest";
DROP TABLE "WorkRequest";
ALTER TABLE "new_WorkRequest" RENAME TO "WorkRequest";
CREATE UNIQUE INDEX "WorkRequest_acceptedBidId_key" ON "WorkRequest"("acceptedBidId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
