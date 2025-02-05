import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { startOfWeek, addWeeks, endOfWeek } from 'date-fns';

export async function getCurrentPayPeriod(req: Request, res: Response) {
  try {
    const today = new Date();
    const currentPeriod = await prisma.payPeriod.findFirst({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    if (!currentPeriod) {
      // Create new pay period if none exists
      const periodStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
      const periodEnd = endOfWeek(addWeeks(periodStart, 1), { weekStartsOn: 1 });

      const newPeriod = await prisma.payPeriod.create({
        data: {
          startDate: periodStart,
          endDate: periodEnd,
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

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping periods
    const overlapping = await prisma.payPeriod.findFirst({
      where: {
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({ error: 'Pay period overlaps with existing period' });
    }

    const payPeriod = await prisma.payPeriod.create({
      data: {
        startDate: start,
        endDate: end,
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

    res.json(payPeriods);
  } catch (error) {
    console.error('Error listing pay periods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 