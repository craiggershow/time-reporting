/*
  Warnings:

  - A unique constraint covering the columns `[startDate,endDate]` on the table `PayPeriod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PayPeriod_startDate_endDate_key" ON "PayPeriod"("startDate", "endDate");
