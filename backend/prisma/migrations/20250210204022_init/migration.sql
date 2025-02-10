-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('REGULAR', 'VACATION', 'SICK', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payPeriodId" TEXT NOT NULL,
    "status" "TimesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "vacationHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayPeriod" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "extraHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "dayType" "DayType" NOT NULL DEFAULT 'REGULAR',
    "startTime" TEXT NOT NULL DEFAULT '00:00',
    "endTime" TEXT NOT NULL DEFAULT '00:00',
    "lunchStartTime" TEXT NOT NULL DEFAULT '00:00',
    "lunchEndTime" TEXT NOT NULL DEFAULT '00:00',
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_userId_payPeriodId_key" ON "Timesheet"("userId", "payPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "PayPeriod_startDate_endDate_key" ON "PayPeriod"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Week_timesheetId_weekNumber_key" ON "Week"("timesheetId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Day_weekId_dayOfWeek_key" ON "Day"("weekId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_timesheetId_idx" ON "Notification"("timesheetId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_payPeriodId_fkey" FOREIGN KEY ("payPeriodId") REFERENCES "PayPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
