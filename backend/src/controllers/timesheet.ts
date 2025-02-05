import { Request as ExpressRequest, Response as ExpressResponse } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { startOfWeek, addWeeks } from 'date-fns';

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

export async function getCurrentTimesheet(req: ExpressRequest, res: ExpressResponse) {
  try {
    // Get current pay period
    const today = new Date();
    const periodStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday

    // For development, create a mock timesheet
    const mockTimesheet = {
      payPeriod: {
        startDate: periodStart,
        endDate: addWeeks(periodStart, 2),
      },
      weeks: [
        {
          weekNumber: 1,
          data: {
            monday: createEmptyDay(),
            tuesday: createEmptyDay(),
            wednesday: createEmptyDay(),
            thursday: createEmptyDay(),
            friday: createEmptyDay(),
            extraHours: 0,
            totalHours: 0,
          },
        },
        {
          weekNumber: 2,
          data: {
            monday: createEmptyDay(),
            tuesday: createEmptyDay(),
            wednesday: createEmptyDay(),
            thursday: createEmptyDay(),
            friday: createEmptyDay(),
            extraHours: 0,
            totalHours: 0,
          },
        },
      ],
      vacationHours: 0,
      totalHours: 0,
    };

    res.status(200).json(mockTimesheet);
  } catch (error) {
    console.error('Error getting current timesheet:', error);
    res.status(500).json({ error: 'Failed to get current timesheet' });
  }
}

function createEmptyDay() {
  return {
    startTime: null,
    endTime: null,
    lunchStartTime: null,
    lunchEndTime: null,
    dayType: 'regular' as const,
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
          update: weeks.map((week: any, index: number) => ({
            where: { timesheetId_weekNumber: { timesheetId: timesheet.id, weekNumber: index + 1 } },
            data: {
              extraHours: week.extraHours,
              days: {
                updateMany: Object.entries(week).map(([day, data]: [string, any]) => ({
                  where: { dayOfWeek: day.toUpperCase() },
                  data: {
                    dayType: data.dayType,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    lunchStartTime: data.lunchStartTime,
                    lunchEndTime: data.lunchEndTime,
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
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function submitTimesheet(req: AuthRequest, res: ExpressResponse) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timesheet = await prisma.timesheet.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    if (timesheet.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (timesheet.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only draft timesheets can be submitted' });
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.status(200).json(updatedTimesheet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ... implement other timesheet controller functions ... 