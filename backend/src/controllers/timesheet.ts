import { Request as ExpressRequest, Response as ExpressResponse } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { startOfWeek, addWeeks } from 'date-fns';
import { DayOfWeek, DayType } from '@prisma/client';

// Define the AuthRequest type
interface AuthRequest extends ExpressRequest {
  user?: {
    userId: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
  };
}

// Add type for timesheet with payPeriod
interface TimesheetWithPayPeriod {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  payPeriodId: string;
  status: string;
  vacationHours: number;
  submittedAt: Date | null;
  payPeriod: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
}

interface DayData {
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  dayType: DayType;
  totalHours: number;
}

interface WeekData {
  weekNumber: number;
  extraHours: number;
  monday: DayData;
  tuesday: DayData;
  wednesday: DayData;
  thursday: DayData;
  friday: DayData;
}

interface TimesheetSubmitData {
  payPeriodId: string;
  vacationHours: number;
  weeks: WeekData[];
}

export async function getCurrentTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Looking for user with ID:', req.user.userId);

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      console.log('User not found in database:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', user.id);

    const today = new Date();
    const periodStart = startOfWeek(today, { weekStartsOn: 1 });
    const periodEnd = addWeeks(periodStart, 2);

    // Then find or create the pay period
    const payPeriod = await prisma.payPeriod.upsert({
      where: {
        id: await prisma.payPeriod.findFirst({
          where: { startDate: periodStart, endDate: periodEnd },
          select: { id: true },
        }).then(pp => pp?.id ?? 'new'),
      },
      create: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      update: {},
    });

    // Then find or create the timesheet with weeks and days
    const timesheet = await prisma.timesheet.upsert({
      where: {
        userId_payPeriodId: {
          userId: user.id,
          payPeriodId: payPeriod.id,
        }
      },
      create: {
        userId: user.id,
        payPeriodId: payPeriod.id,
        status: 'DRAFT',
        vacationHours: 0,
        weeks: {
          create: [
            {
              weekNumber: 1,
              extraHours: 0,
              days: {
                create: [
                  { dayOfWeek: 'MONDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'TUESDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'WEDNESDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'THURSDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'FRIDAY', dayType: 'REGULAR', totalHours: 0 },
                ],
              },
            },
            {
              weekNumber: 2,
              extraHours: 0,
              days: {
                create: [
                  { dayOfWeek: 'MONDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'TUESDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'WEDNESDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'THURSDAY', dayType: 'REGULAR', totalHours: 0 },
                  { dayOfWeek: 'FRIDAY', dayType: 'REGULAR', totalHours: 0 },
                ],
              },
            },
          ],
        },
      },
      update: {},
      include: {
        payPeriod: true,
        weeks: {
          include: {
            days: {
              orderBy: {
                dayOfWeek: 'asc',
              },
            },
          },
          orderBy: {
            weekNumber: 'asc',
          },
        },
      },
    });

    // Format the response to match frontend expectations
    const formattedResponse = {
      id: timesheet.id,
      userId: timesheet.userId,
      payPeriod: timesheet.payPeriod,
      status: timesheet.status,
      vacationHours: timesheet.vacationHours,
      submittedAt: timesheet.submittedAt,
      weeks: timesheet.weeks.map(week => ({
        weekNumber: week.weekNumber,
        extraHours: week.extraHours,
        monday: week.days.find(d => d.dayOfWeek === 'MONDAY') || createEmptyDay(),
        tuesday: week.days.find(d => d.dayOfWeek === 'TUESDAY') || createEmptyDay(),
        wednesday: week.days.find(d => d.dayOfWeek === 'WEDNESDAY') || createEmptyDay(),
        thursday: week.days.find(d => d.dayOfWeek === 'THURSDAY') || createEmptyDay(),
        friday: week.days.find(d => d.dayOfWeek === 'FRIDAY') || createEmptyDay(),
      })),
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Error getting current timesheet:', error);
    res.status(500).json({ error: 'Failed to get current timesheet' });
  }
}

function createEmptyDay() {
  return {
    startTime: "00:00",
    endTime: "00:00",
    lunchStartTime: "00:00",
    lunchEndTime: "00:00",
    dayType: 'REGULAR',
    totalHours: 0,
  };
}

export async function getPreviousTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const previousTimesheet = await prisma.timesheet.findFirst({
      where: {
        userId: req.user.userId,
        status: 'SUBMITTED',
      },
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        payPeriod: true,
        weeks: {
          include: { days: true },
        },
      },
    });

    if (!previousTimesheet) {
      return res.status(404).json({ error: 'No previous timesheet found' });
    }

    res.status(200).json({
      ...previousTimesheet,
      isCurrentPeriod: false,
      readOnly: true,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timesheet = await prisma.timesheet.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        payPeriod: true,
        weeks: {
          include: {
            days: true,
          },
        },
      },
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    if (timesheet.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

function formatTimeForStorage(time: string | null): string {
  return time || "00:00";
}

export async function updateTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    const { weeks, vacationHours } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify this is the current pay period
    const timesheet = await prisma.timesheet.findUnique({
      where: {
        userId_payPeriodId: {
          userId: req.user.userId,
          payPeriodId: req.body.payPeriodId,
        },
      },
      include: {
        payPeriod: true,
      },
    }) as TimesheetWithPayPeriod | null;

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    // Ensure timesheet is for current period
    const today = new Date();
    if (timesheet.payPeriod.endDate < today) {
      return res.status(403).json({ error: 'Cannot modify previous pay period timesheet' });
    }

    // Update or create timesheet
    const updatedTimesheet = await prisma.timesheet.update({
      where: {
        userId_payPeriodId: {
          userId: req.user.userId,
          payPeriodId: req.body.payPeriodId,
        },
      },
      data: {
        vacationHours,
        weeks: {
          update: weeks.map((week: WeekData, index: number) => ({
            where: { timesheetId_weekNumber: { timesheetId: timesheet.id, weekNumber: index + 1 } },
            data: {
              extraHours: week.extraHours,
              days: {
                updateMany: Object.entries(week)
                  .filter(([key]) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key))
                  .map(([day, data]: [string, DayData]) => ({
                    where: { dayOfWeek: day.toUpperCase() },
                    data: {
                      dayType: data.dayType,
                      startTime: formatTimeForStorage(data.startTime),
                      endTime: formatTimeForStorage(data.endTime),
                      lunchStartTime: formatTimeForStorage(data.lunchStartTime),
                      lunchEndTime: formatTimeForStorage(data.lunchEndTime),
                      totalHours: data.totalHours,
                    },
                  })),
              },
            },
          })),
        },
      },
      include: {
        weeks: {
          include: {
            days: true,
          },
        },
      },
    });

    res.status(200).json(updatedTimesheet);
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function parseTimeString(timeStr: string): Date {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time:', error);
    return new Date(0); // midnight as fallback
  }
}

function formatDateToTimeString(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

export async function submitTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    const { payPeriodId, weeks, vacationHours } = req.body as TimesheetSubmitData;
    const { userId } = req.user!;

    // First find the timesheet
    const timesheet = await prisma.timesheet.findUnique({
      where: { 
        userId_payPeriodId: {
          userId,
          payPeriodId,
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    // Then update with all data
    const updatedTimesheet = await prisma.timesheet.update({
      where: { 
        userId_payPeriodId: {
          userId,
          payPeriodId,
        }
      },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        vacationHours,
        weeks: {
          update: weeks.map((week) => ({
            where: { 
              timesheetId_weekNumber: {
                timesheetId: timesheet.id,
                weekNumber: week.weekNumber,
              }
            },
            data: {
              extraHours: week.extraHours || 0,
              days: {
                updateMany: [
                  {
                    where: { dayOfWeek: 'MONDAY' },
                    data: {
                      dayType: week.monday.dayType,
                      startTime: formatTimeForStorage(week.monday.startTime),
                      endTime: formatTimeForStorage(week.monday.endTime),
                      lunchStartTime: formatTimeForStorage(week.monday.lunchStartTime),
                      lunchEndTime: formatTimeForStorage(week.monday.lunchEndTime),
                      totalHours: week.monday.totalHours,
                    },
                  },
                  {
                    where: { dayOfWeek: 'TUESDAY' },
                    data: {
                      dayType: week.tuesday.dayType,
                      startTime: formatTimeForStorage(week.tuesday.startTime),
                      endTime: formatTimeForStorage(week.tuesday.endTime),
                      lunchStartTime: formatTimeForStorage(week.tuesday.lunchStartTime),
                      lunchEndTime: formatTimeForStorage(week.tuesday.lunchEndTime),
                      totalHours: week.tuesday.totalHours,
                    },
                  },
                  {
                    where: { dayOfWeek: 'WEDNESDAY' },
                    data: {
                      dayType: week.wednesday.dayType,
                      startTime: formatTimeForStorage(week.wednesday.startTime),
                      endTime: formatTimeForStorage(week.wednesday.endTime),
                      lunchStartTime: formatTimeForStorage(week.wednesday.lunchStartTime),
                      lunchEndTime: formatTimeForStorage(week.wednesday.lunchEndTime),
                      totalHours: week.wednesday.totalHours,
                    },
                  },
                  {
                    where: { dayOfWeek: 'THURSDAY' },
                    data: {
                      dayType: week.thursday.dayType,
                      startTime: formatTimeForStorage(week.thursday.startTime),
                      endTime: formatTimeForStorage(week.thursday.endTime),
                      lunchStartTime: formatTimeForStorage(week.thursday.lunchStartTime),
                      lunchEndTime: formatTimeForStorage(week.thursday.lunchEndTime),
                      totalHours: week.thursday.totalHours,
                    },
                  },
                  {
                    where: { dayOfWeek: 'FRIDAY' },
                    data: {
                      dayType: week.friday.dayType,
                      startTime: formatTimeForStorage(week.friday.startTime),
                      endTime: formatTimeForStorage(week.friday.endTime),
                      lunchStartTime: formatTimeForStorage(week.friday.lunchStartTime),
                      lunchEndTime: formatTimeForStorage(week.friday.lunchEndTime),
                      totalHours: week.friday.totalHours,
                    },
                  },
                ],
              },
            },
          })),
        },
      },
      include: {
        payPeriod: true,
        weeks: {
          include: {
            days: {
              orderBy: {
                dayOfWeek: 'asc',
              },
            },
          },
          orderBy: {
            weekNumber: 'asc',
          },
        },
      },
    });

    res.json(updatedTimesheet);
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function recallTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    const { id } = req.params;

    // Find timesheet
    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    // Verify ownership
    if (timesheet.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only recall SUBMITTED timesheets
    if (timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: 'Only submitted timesheets can be recalled' 
      });
    }

    // Update status back to DRAFT
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: {
        status: 'DRAFT',
        submittedAt: null,
      },
    });

    res.json(updatedTimesheet);
  } catch (error) {
    console.error('Error recalling timesheet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ... implement other timesheet controller functions ... 