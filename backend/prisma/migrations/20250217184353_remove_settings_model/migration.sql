/*
  Warnings:

  - You are about to drop the column `payRate` on the `Holiday` table. All the data in the column will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Holiday" DROP COLUMN "payRate";

-- DropTable
DROP TABLE "Settings";
