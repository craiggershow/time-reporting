import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { startOfWeek, addWeeks, endOfWeek, parseISO } from 'date-fns';

// Helper function to normalize date to YYYY-MM-DD format without time component
function normalizeDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to create a date from YYYY-MM-DD string
function createDateFromYYYYMMDD(dateStr: string): Date {
  // Set time to noon to avoid timezone issues
  return new Date(`${dateStr}T12:00:00Z`);
}

export async function getCurrentPayPeriod(req: Request, res: Response) {
  try {
    const today = new Date();
    const todayStr = normalizeDateToYYYYMMDD(today);
    
    const currentPeriod = await prisma.payPeriod.findFirst({
      where: {
        startDate: { lte: todayStr },
        endDate: { gte: todayStr },
      },
    });

    if (!currentPeriod) {
      // Create new pay period if none exists
      const periodStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
      const periodEnd = endOfWeek(addWeeks(periodStart, 1), { weekStartsOn: 1 });

      // Normalize dates to YYYY-MM-DD format
      const startDateStr = normalizeDateToYYYYMMDD(periodStart);
      const endDateStr = normalizeDateToYYYYMMDD(periodEnd);

      const newPeriod = await prisma.payPeriod.create({
        data: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
      });

      return res.json(newPeriod);
    }

    res.json(currentPeriod);
  } catch (error) {
    console.error('Error getting current pay period:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPayPeriod(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.body;

    // Validate dates - ensure we're working with YYYY-MM-DD strings
    const startDateStr = typeof startDate === 'string' ? startDate.split('T')[0] : normalizeDateToYYYYMMDD(new Date(startDate));
    const endDateStr = typeof endDate === 'string' ? endDate.split('T')[0] : normalizeDateToYYYYMMDD(new Date(endDate));
    
    // Create date objects for comparison (with time set to noon)
    const start = createDateFromYYYYMMDD(startDateStr);
    const end = createDateFromYYYYMMDD(endDateStr);

    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping periods
    const overlapping = await prisma.payPeriod.findFirst({
      where: {
        OR: [
          {
            startDate: { lte: endDateStr },
            endDate: { gte: startDateStr },
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({ error: 'Pay period overlaps with existing period' });
    }

    const payPeriod = await prisma.payPeriod.create({
      data: {
        startDate: startDateStr,
        endDate: endDateStr,
      },
    });

    res.status(201).json(payPeriod);
  } catch (error) {
    console.error('Error creating pay period:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listPayPeriods(req: Request, res: Response) {
  try {
    const payPeriods = await prisma.payPeriod.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        timesheets: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Ensure dates are in YYYY-MM-DD format without time component
    const formattedPayPeriods = payPeriods.map(period => ({
      ...period,
      startDate: typeof period.startDate === 'string' ? period.startDate.split('T')[0] : normalizeDateToYYYYMMDD(new Date(period.startDate)),
      endDate: typeof period.endDate === 'string' ? period.endDate.split('T')[0] : normalizeDateToYYYYMMDD(new Date(period.endDate)),
    }));

    res.json(formattedPayPeriods);
  } catch (error) {
    console.error('Error listing pay periods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 