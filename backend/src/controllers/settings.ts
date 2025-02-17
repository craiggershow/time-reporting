import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { TimesheetSettings } from '../types/settings';
import { DEFAULT_TIMESHEET_SETTINGS } from '../config/defaults';

export async function getSettings(req: Request, res: Response) {
  try {
    // Fetch holidays
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });

    // Combine default settings with holidays
    const settings: TimesheetSettings = {
      ...DEFAULT_TIMESHEET_SETTINGS,
      holidays: holidays.map(h => ({
        ...h,
        date: new Date(h.date),
      })),
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { holidays, ...otherSettings } = req.body as TimesheetSettings;

    // Update main settings
    await prisma.settings.upsert({
      where: { key: 'timesheet_settings' },
      update: { value: otherSettings },
      create: {
        key: 'timesheet_settings',
        value: otherSettings
      }
    });

    // Update holidays if provided
    if (holidays) {
      await prisma.holiday.deleteMany();
      if (holidays.length > 0) {
        await prisma.holiday.createMany({
          data: holidays.map(h => ({
            date: new Date(h.date),
            name: h.name,
            hoursDefault: h.hoursDefault,
            payMultiplier: h.payMultiplier
          })),
        });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
} 