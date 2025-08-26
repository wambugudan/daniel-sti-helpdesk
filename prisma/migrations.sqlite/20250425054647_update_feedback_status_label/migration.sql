-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubmissionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CHANGES_REQUESTED',
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "councilId" TEXT NOT NULL,
    "replyMessage" TEXT,
    "replyAt" DATETIME,
    CONSTRAINT "SubmissionFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionFeedback_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubmissionFeedback" ("comment", "councilId", "createdAt", "id", "replyAt", "replyMessage", "status", "submissionId") SELECT "comment", "councilId", "createdAt", "id", "replyAt", "replyMessage", "status", "submissionId" FROM "SubmissionFeedback";
DROP TABLE "SubmissionFeedback";
ALTER TABLE "new_SubmissionFeedback" RENAME TO "SubmissionFeedback";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
