/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Timesheet` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `Timesheet` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `Timesheet` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedById` on the `Timesheet` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Timesheet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Timesheet" DROP CONSTRAINT "Timesheet_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Timesheet" DROP CONSTRAINT "Timesheet_rejectedById_fkey";

-- AlterTable
ALTER TABLE "Timesheet" DROP COLUMN "approvedAt",
DROP COLUMN "approvedById",
DROP COLUMN "rejectedAt",
DROP COLUMN "rejectedById",
DROP COLUMN "rejectionReason";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_timesheetId_idx" ON "Notification"("timesheetId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
