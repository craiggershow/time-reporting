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
    //console.log('=== Getting Current Pay Period ===');
    const settings = await prisma.settings.findUnique({
      where: { key: 'timesheet_settings' }
    });

    if (!settings) {
      throw new Error('Timesheet settings not found');
    }

    //console.log('Settings found:', settings);
    const { payPeriodStartDate } = settings.value as { payPeriodStartDate: string };
    //console.log('Pay period start date from settings (raw):', payPeriodStartDate);
    
    // Parse the base start date from settings - use YYYY-MM-DD format
    // The payPeriodStartDate should already be in YYYY-MM-DD format
    const [year, month, day] = payPeriodStartDate.split('-').map(num => parseInt(num, 10));
    
    // Validate the date components
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error(`Invalid pay period start date format: ${payPeriodStartDate}`);
    }
    
    // Create a date object with the date components (no time)
    const baseStartDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    //console.log('Base start date (parsed):', 
    //  `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    
    // Get current date without time component
    const now = new Date();
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //console.log('Current date (date only):', 
    //  `${nowDateOnly.getFullYear()}-${(nowDateOnly.getMonth() + 1).toString().padStart(2, '0')}-${nowDateOnly.getDate().toString().padStart(2, '0')}`);
    
    // Calculate the current pay period start date
    const currentStartDate = new Date(baseStartDate);
    //console.log('Initial currentStartDate:', 
    //  `${currentStartDate.getFullYear()}-${(currentStartDate.getMonth() + 1).toString().padStart(2, '0')}-${currentStartDate.getDate().toString().padStart(2, '0')}`);
    
    // Find the most recent pay period start date that is not in the future
    while (currentStartDate <= nowDateOnly) {
      currentStartDate.setDate(currentStartDate.getDate() + 14);
    }
    
    // Go back one pay period since we went past the current date
    currentStartDate.setDate(currentStartDate.getDate() - 14);
    //console.log('Final currentStartDate (after adjustment):', 
    //  `${currentStartDate.getFullYear()}-${(currentStartDate.getMonth() + 1).toString().padStart(2, '0')}-${currentStartDate.getDate().toString().padStart(2, '0')}`);
    
    const endDate = new Date(currentStartDate);
    endDate.setDate(endDate.getDate() + 13); // 14 days total (0-13)
    //console.log('End date of pay period:', 
    //  `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`);

    // Find or create pay period
    //console.log('Looking for pay period in database with start:', 
    //  `${currentStartDate.getFullYear()}-${(currentStartDate.getMonth() + 1).toString().padStart(2, '0')}-${currentStartDate.getDate().toString().padStart(2, '0')}`, 
    //  'end:', 
    //  `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`);
    
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
    
    //console.log('Pay period found/created:', payPeriod);
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
          extraHours: timesheet.weeks.find(w => w.weekNumber === 1)?.extraHours || 0,
          days: {
            monday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'MONDAY') || null,
            tuesday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'TUESDAY') || null,
            wednesday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'WEDNESDAY') || null,
            thursday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'THURSDAY') || null,
            friday: timesheet.weeks.find(w => w.weekNumber === 1)?.days.find(d => d.dayOfWeek === 'FRIDAY') || null,
          }
        },
        week2: {
          extraHours: timesheet.weeks.find(w => w.weekNumber === 2)?.extraHours || 0,
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
    //console.log(transformedTimesheet);
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
  //console.log('\n=== Submit Timesheet ===');
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
  //console.log('\n=== Get All Timesheets ===');
  try {
    // Implementation
    res.json({ message: 'Get all timesheets' });
  } catch (error) {
    console.error('Get all timesheets error:', error);
    res.status(500).json({ error: 'Failed to get timesheets' });
  }
}

export async function approveTimesheet(req: AuthRequest, res: ExpressResponse) {
  //console.log('\n=== Approve Timesheet ===');
  try {
    // Implementation
    res.json({ message: 'Approve timesheet' });
  } catch (error) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ error: 'Failed to approve timesheet' });
  }
}

// Add the updateTimeEntry function
export const updateTimeEntry = async (req: AuthRequest, res: ExpressResponse) => {
  try {
    const { timesheetId, week, day, entry } = req.body;
    //console.log(`[updateTimeEntry] Updating time entry for timesheet ${timesheetId}, week ${week}, day ${day}`);
    //console.log(`[updateTimeEntry] Entry data:`, entry);

    // Validate that dayType is a valid enum value
    if (entry.dayType && !Object.values(DayType).includes(entry.dayType)) {
      console.error(`[updateTimeEntry] Invalid day type: ${entry.dayType}`);
      return res.status(400).json({ error: `Invalid day type: ${entry.dayType}` });
    }

    // For special day types, ensure time entries are cleared
    if (entry.dayType === DayType.VACATION || entry.dayType === DayType.SICK || entry.dayType === DayType.HOLIDAY) {
      entry.startTime = null;
      entry.endTime = null;
      entry.lunchStartTime = null;
      entry.lunchEndTime = null;
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the timesheet
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: timesheetId,
        userId: req.user.id,
      },
      include: {
        weeks: {
          where: {
            weekNumber: parseInt(week),
          },
          include: {
            days: {
              where: {
                dayOfWeek: day.toUpperCase(),
              },
            },
          },
        },
      },
    });

    if (!timesheet) {
      console.error('[updateTimeEntry] Timesheet not found');
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    if (timesheet.weeks.length === 0) {
      console.error('[updateTimeEntry] Week not found');
      return res.status(404).json({ error: 'Week not found' });
    }

    const weekData = timesheet.weeks[0];
    if (weekData.days.length === 0) {
      console.error('[updateTimeEntry] Day not found');
      return res.status(404).json({ error: 'Day not found' });
    }

    const dayData = weekData.days[0];

    // Update the day entry
    const updatedDay = await prisma.day.update({
      where: {
        id: dayData.id,
      },
      data: {
        startTime: entry.startTime,
        endTime: entry.endTime,
        lunchStartTime: entry.lunchStartTime,
        lunchEndTime: entry.lunchEndTime,
        dayType: entry.dayType,
        totalHours: entry.totalHours,
      },
    });

    //console.log(`[updateTimeEntry] Day updated successfully:`, updatedDay);
    return res.json(updatedDay);
  } catch (error) {
    console.error('[updateTimeEntry] Error:', error);
    return res.status(500).json({ error: 'Failed to update time entry' });
  }
};

export const updateExtraHours = async (req: AuthRequest, res: ExpressResponse) => {
  try {
    const { timesheetId, week, hours } = req.body;
    //console.log(`[updateExtraHours] Updating extra hours for timesheet ${timesheetId}, week ${week}`);
    //console.log(`[updateExtraHours] Hours: ${hours}`);

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the timesheet
    const timesheet = await prisma.timesheet.findUnique({
      where: {
        id: timesheetId,
      },
      include: {
        weeks: {
          where: {
            weekNumber: parseInt(week),
          },
        },
      },
    });

    if (!timesheet) {
      console.error('[updateExtraHours] Timesheet not found');
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    if (timesheet.weeks.length === 0) {
      console.error('[updateExtraHours] Week not found');
      return res.status(404).json({ error: 'Week not found' });
    }

    const weekData = timesheet.weeks[0];

    // Update the extra hours
    const updatedWeek = await prisma.week.update({
      where: {
        id: weekData.id,
      },
      data: {
        extraHours: hours,
      },
    });

    //console.log(`[updateExtraHours] Week updated successfully:`, updatedWeek);
    return res.json(updatedWeek);
  } catch (error) {
    console.error('[updateExtraHours] Error:', error);
    return res.status(500).json({ error: 'Failed to update extra hours' });
  }
};

export const updateVacationHours = async (req: AuthRequest, res: ExpressResponse) => {
  try {
    const { timesheetId, hours } = req.body;
    //console.log(`[updateVacationHours] Updating vacation hours for timesheet ${timesheetId}`);
    //console.log(`[updateVacationHours] Hours: ${hours}`);

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the timesheet
    const timesheet = await prisma.timesheet.findUnique({
      where: {
        id: timesheetId,
      },
    });

    if (!timesheet) {
      console.error('[updateVacationHours] Timesheet not found');
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    // Update the vacation hours
    const updatedTimesheet = await prisma.timesheet.update({
      where: {
        id: timesheetId,
      },
      data: {
        vacationHours: hours,
      },
    });

    //console.log(`[updateVacationHours] Timesheet updated successfully:`, updatedTimesheet);
    return res.json(updatedTimesheet);
  } catch (error) {
    console.error('[updateVacationHours] Error:', error);
    return res.status(500).json({ error: 'Failed to update vacation hours' });
  }
};

// ... implement other timesheet controller functions ... 