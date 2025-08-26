-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workRequestId" TEXT NOT NULL,
    "acceptedBidId" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "finalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "Bid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_workRequestId_key" ON "Contract"("workRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_acceptedBidId_key" ON "Contract"("acceptedBidId");
