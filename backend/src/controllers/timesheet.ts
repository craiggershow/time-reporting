import { Request as ExpressRequest, Response as ExpressResponse } from 'express-serve-static-core';
import { PrismaClient, DayOfWeek, DayType, PayPeriod, TimesheetStatus } from '@prisma/client';
import { startOfWeek, addWeeks, addDays } from 'date-fns';
import { prisma } from '../lib/prisma';

const prismaClient = new PrismaClient();

// Define the AuthRequest type
interface AuthRequest extends ExpressRequest {
  user?: {
    id: string;
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

function createEmptyDay(dayOfWeek: DayOfWeek) {
  return {
    dayOfWeek,
    dayType: DayType.REGULAR,
    startTime: null,
    endTime: null,
    lunchStartTime: null,
    lunchEndTime: null,
    totalHours: 0,
  };
}

async function createEmptyTimesheet(userId: string, payPeriodId: string) {
  const timesheet = await prismaClient.timesheet.create({
    data: {
      userId,
      payPeriodId,
      status: TimesheetStatus.DRAFT,
      vacationHours: 0,
      weeks: {
        create: [1, 2].map(weekNumber => ({
          weekNumber,
          extraHours: 0,
          days: {
            create: [
              DayOfWeek.MONDAY,
              DayOfWeek.TUESDAY,
              DayOfWeek.WEDNESDAY,
              DayOfWeek.THURSDAY,
              DayOfWeek.FRIDAY,
            ].map(dayOfWeek => createEmptyDay(dayOfWeek))
          }
        }))
      }
    },
    include: {
      weeks: {
        include: {
          days: true
        }
      }
    }
  });

  return timesheet;
}

interface PayPeriodDates {
  startDate: Date;
  endDate: Date;
}

async function getCurrentPayPeriod(): Promise<{ id: string; startDate: Date; endDate: Date }> {
  try {
    const settings = await prisma.settings.findUnique({
      where: { key: 'timesheet_settings' }
    });

    if (!settings) {
      throw new Error('Timesheet settings not found');
    }

    const { payPeriodStartDate } = settings.value as { payPeriodStartDate: string };
    const baseStartDate = new Date(payPeriodStartDate);
    baseStartDate.setHours(0, 0, 0, 0); // Set to midnight but keep date only for comparisons
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to midnight for date-only comparison
    
    const currentStartDate = new Date(baseStartDate);
    while (currentStartDate <= now) {
      currentStartDate.setDate(currentStartDate.getDate() + 14);
    }
    currentStartDate.setDate(currentStartDate.getDate() - 14);
    
    const endDate = new Date(currentStartDate);
    endDate.setDate(endDate.getDate() + 13);

    // Find or create pay period
    const payPeriod = await prisma.payPeriod.upsert({
      where: {
        startDate_endDate: {
          startDate: currentStartDate,
          endDate: endDate
        }
      },
      create: {
        startDate: currentStartDate,
        endDate: endDate
      },
      update: {}
    });

    return payPeriod;
  } catch (error) {
    console.error('Error getting pay period:', error);
    throw error;
  }
}

export async function getCurrentTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    // Get or create the pay period
    const payPeriod = await getCurrentPayPeriod();

    // Find or create timesheet
    const timesheet = await prisma.timesheet.upsert({
      where: {
        userId_payPeriodId: {
          userId: req.user?.id || '',
          payPeriodId: payPeriod.id
        }
      },
      create: {
        userId: req.user?.id || '',
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
            days: true
          }
        }
      }
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'No current timesheet found' });
    }

    // Transform the data structure while preserving pay period info
    const transformedTimesheet = {
      id: timesheet.id,
      userId: timesheet.userId,
      status: timesheet.status,
      payPeriod: timesheet.payPeriod,
      vacationHours: timesheet.vacationHours,
      submittedAt: timesheet.submittedAt,
      weeks: {
        week1: {
          days: {
            monday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'MONDAY') || null,
            tuesday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'TUESDAY') || null,
            wednesday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'WEDNESDAY') || null,
            thursday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'THURSDAY') || null,
            friday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'FRIDAY') || null,
          }
        },
        week2: {
          days: {
            monday: timesheet.weeks.find(w => w.weekNumber === 2)?.days.find(d => d.dayOfWeek === 'MONDAY') || null,
            tuesday: timesheet.weeks.find(w => w.weekNumber === 2)?.days.find(d => d.dayOfWeek === 'TUESDAY') || null,
            wednesday: timesheet.weeks.find(w => w.weekNumber === 2)?.days.find(d => d.dayOfWeek === 'WEDNESDAY') || null,
            thursday: timesheet.weeks.find(w => w.weekNumber === 2)?.days.find(d => d.dayOfWeek === 'THURSDAY') || null,
            friday: timesheet.weeks.find(w => w.weekNumber === 2)?.days.find(d => d.dayOfWeek === 'FRIDAY') || null,
          }
        }
      }
    };

    res.json(transformedTimesheet);
  } catch (error) {
    console.error('Get current timesheet error:', error);
    res.status(500).json({ error: 'Failed to get current timesheet' });
  }
}

export async function getPreviousTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const previousTimesheet = await prismaClient.timesheet.findFirst({
      where: {
        userId: req.user.id,
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
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timesheet = await prismaClient.timesheet.findUnique({
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

    if (timesheet.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(timesheet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

function formatTimeForStorage(time: string | null): string | null {
  // Return null if time is null or empty
  if (!time || time.trim() === '') return null;
  
  // Keep the original time string if it's already in 24-hour format
  if (time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return time;
  }
  
  return time;
}

export async function updateTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    const { weeks, vacationHours } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify this is the current pay period
    const timesheet = await prismaClient.timesheet.findUnique({
      where: {
        userId_payPeriodId: {
          userId: req.user.id,
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
    const updatedTimesheet = await prismaClient.timesheet.update({
      where: {
        userId_payPeriodId: {
          userId: req.user.id,
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
  console.log('\n=== Submit Timesheet ===');
  try {
    const { payPeriodId, weeks, vacationHours } = req.body as TimesheetSubmitData;

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // First, find the existing timesheet to get its ID
    const existingTimesheet = await prismaClient.timesheet.findUnique({
      where: {
        userId_payPeriodId: {
          userId: req.user.id,
          payPeriodId,
        },
      },
    });

    // Create or update timesheet
    const timesheet = await prismaClient.timesheet.upsert({
      where: {
        userId_payPeriodId: {
          userId: req.user.id,
          payPeriodId,
        },
      },
      create: {
        userId: req.user.id,
        payPeriodId,
        status: TimesheetStatus.SUBMITTED,
        submittedAt: new Date(),
        vacationHours,
        weeks: {
          create: weeks.map(week => ({
            weekNumber: week.weekNumber,
            extraHours: week.extraHours,
            days: {
              create: Object.entries(week)
                .filter(([key]) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key))
                .map(([dayOfWeek, day]) => ({
                  dayOfWeek: dayOfWeek.toUpperCase(),
                  dayType: day.dayType,
                  startTime: formatTimeForStorage(day.startTime),
                  endTime: formatTimeForStorage(day.endTime),
                  lunchStartTime: formatTimeForStorage(day.lunchStartTime),
                  lunchEndTime: formatTimeForStorage(day.lunchEndTime),
                  totalHours: day.totalHours,
                })),
            },
          })),
        },
      },
      update: {
        status: TimesheetStatus.SUBMITTED,
        submittedAt: new Date(),
        vacationHours,
        weeks: {
          update: weeks.map((week) => ({
            where: { 
              timesheetId_weekNumber: { 
                timesheetId: existingTimesheet?.id || '', 
                weekNumber: week.weekNumber 
              } 
            },
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

    res.json(timesheet);
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({ error: 'Failed to submit timesheet' });
  }
}

export async function recallTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    const { id } = req.params;

    // Find timesheet
    const timesheet = await prismaClient.timesheet.findUnique({
      where: { id },
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    // Verify ownership
    if (timesheet.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only recall SUBMITTED timesheets
    if (timesheet.status !== 'SUBMITTED') {
      return res.status(400).json({ 
        error: 'Only submitted timesheets can be recalled' 
      });
    }

    // Update status back to DRAFT
    const updatedTimesheet = await prismaClient.timesheet.update({
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

export async function getAllTimesheets(req: AuthRequest, res: ExpressResponse) {
  console.log('\n=== Get All Timesheets ===');
  try {
    // Implementation
    res.json({ message: 'Get all timesheets' });
  } catch (error) {
    console.error('Get all timesheets error:', error);
    res.status(500).json({ error: 'Failed to get timesheets' });
  }
}

export async function approveTimesheet(req: AuthRequest, res: ExpressResponse) {
  console.log('\n=== Approve Timesheet ===');
  try {
    // Implementation
    res.json({ message: 'Approve timesheet' });
  } catch (error) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ error: 'Failed to approve timesheet' });
  }
}

// ... implement other timesheet controller functions ... 