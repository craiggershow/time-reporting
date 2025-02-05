/*
  Warnings:

  - The `status` column on the `Timesheet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Timesheet" DROP COLUMN "status",
ADD COLUMN     "status" "TimesheetStatus" NOT NULL DEFAULT 'DRAFT';
