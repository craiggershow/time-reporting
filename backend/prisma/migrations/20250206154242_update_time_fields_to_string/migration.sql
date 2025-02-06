/*
  Warnings:

  - Made the column `startTime` on table `Day` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `Day` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lunchStartTime` on table `Day` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lunchEndTime` on table `Day` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Day" ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "startTime" SET DEFAULT '00:00',
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET NOT NULL,
ALTER COLUMN "endTime" SET DEFAULT '00:00',
ALTER COLUMN "endTime" SET DATA TYPE TEXT,
ALTER COLUMN "lunchStartTime" SET NOT NULL,
ALTER COLUMN "lunchStartTime" SET DEFAULT '00:00',
ALTER COLUMN "lunchStartTime" SET DATA TYPE TEXT,
ALTER COLUMN "lunchEndTime" SET NOT NULL,
ALTER COLUMN "lunchEndTime" SET DEFAULT '00:00',
ALTER COLUMN "lunchEndTime" SET DATA TYPE TEXT;
