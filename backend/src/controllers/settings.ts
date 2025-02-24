import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { TimesheetSettings } from '../types/settings';
import { DEFAULT_TIMESHEET_SETTINGS } from '../config/defaults';

export async function getSettings(req: Request, res: Response) {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: {date: 'asc'},
    });  

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

    // Ensure payPeriodStartDate is stored as UTC midnight
    if (otherSettings.payPeriodStartDate) {
      const date = new Date(otherSettings.payPeriodStartDate);
      // Create new date at UTC midnight for the local date
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      otherSettings.payPeriodStartDate = localDate;
    }

    // Update main settings
    await prisma.settings.upsert({
      where: { key: 'timesheet_settings' },
      update: { value: otherSettings },
      create: {
        key: 'timesheet_settings',
        value: otherSettings
      }
    });

    // Update holidays with proper date handling
    if (holidays) {
      await prisma.holiday.deleteMany();
      if (holidays.length > 0) {
        await prisma.holiday.createMany({
          data: holidays.map(h => {
            const date = new Date(h.date);
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return {
              date: localDate,
              name: h.name,
              hoursDefault: h.hoursDefault,
              payMultiplier: h.payMultiplier
            };
          }),
        });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
} 