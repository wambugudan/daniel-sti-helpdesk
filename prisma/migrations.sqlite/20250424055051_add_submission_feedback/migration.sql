-- CreateTable
CREATE TABLE "SubmissionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "councilId" TEXT NOT NULL,
    CONSTRAINT "SubmissionFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionFeedback_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
