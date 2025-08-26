-- CreateEnum
CREATE TYPE "RelatedType" AS ENUM ('WORK_REQUEST', 'CONTRACT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COUNCIL', 'EXPERT', 'ADMIN');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('CHANGES_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_BID', 'BID_ACCEPTED', 'SUBMISSION', 'FEEDBACK', 'MESSAGE', 'INVITE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EXPERT',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "areaOfProfessionalExperience" TEXT,
    "publications" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileURL" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "durationDays" INTEGER,
    "status" "WorkRequestStatus" NOT NULL DEFAULT 'OPEN',
    "acceptedBidId" TEXT,

    CONSTRAINT "WorkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fileURL" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bidId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionMessage" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "fileURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "councilId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "relatedTitle" TEXT NOT NULL,
    "relatedType" "RelatedType" NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "workRequestId" TEXT NOT NULL,
    "acceptedBidId" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkRequest_acceptedBidId_key" ON "WorkRequest"("acceptedBidId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_bidId_key" ON "Submission"("bidId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_workRequestId_key" ON "Contract"("workRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_acceptedBidId_key" ON "Contract"("acceptedBidId");

-- AddForeignKey
ALTER TABLE "WorkRequest" ADD CONSTRAINT "WorkRequest_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRequest" ADD CONSTRAINT "WorkRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMessage" ADD CONSTRAINT "SubmissionMessage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMessage" ADD CONSTRAINT "SubmissionMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_workRequestId_fkey" FOREIGN KEY ("workRequestId") REFERENCES "WorkRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
