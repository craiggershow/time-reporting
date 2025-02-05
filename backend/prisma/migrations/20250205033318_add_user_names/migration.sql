/*
  Warnings:

  - The `startTime` column on the `Day` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endTime` column on the `Day` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lunchStartTime` column on the `Day` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lunchEndTime` column on the `Day` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CompanySettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Week" DROP CONSTRAINT "Week_timesheetId_fkey";

-- DropIndex
DROP INDEX "PayPeriod_startDate_key";

-- AlterTable
ALTER TABLE "Day" DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3),
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3),
DROP COLUMN "lunchStartTime",
ADD COLUMN     "lunchStartTime" TIMESTAMP(3),
DROP COLUMN "lunchEndTime",
ADD COLUMN     "lunchEndTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Timesheet" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "CompanySettings";

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
