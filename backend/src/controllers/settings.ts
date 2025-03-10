import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { TimesheetSettings } from '../types/settings';
import { DEFAULT_TIMESHEET_SETTINGS } from '../config/defaults';

export async function getSettings(req: Request, res: Response) {
  try {
    // Get settings from database
    const dbSettings = await prisma.settings.findUnique({
      where: { key: 'timesheet_settings' }
    });

    // Get holidays from database
    const holidays = await prisma.holiday.findMany({
      orderBy: {date: 'asc'},
    });  

    // Merge database settings with defaults (for any missing fields)
    const settings: TimesheetSettings = {
      ...DEFAULT_TIMESHEET_SETTINGS,
      ...(dbSettings?.value as TimesheetSettings || {}),
      holidays: holidays.map(h => ({
        ...h,
        date: new Date(h.date),  
      })),
    };
    
    console.log('Retrieved settings:', {
      payPeriodStartDate: settings.payPeriodStartDate,
      fromDB: dbSettings?.value ? 'yes' : 'no (using defaults)'
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { holidays, ...otherSettings } = req.body as TimesheetSettings;

    // Ensure payPeriodStartDate is stored as a string in YYYY-MM-DD format without timezone adjustments
    if (otherSettings.payPeriodStartDate) {
      // If it's a string with a time component, strip it
      if (typeof otherSettings.payPeriodStartDate === 'string' && otherSettings.payPeriodStartDate.includes('T')) {
        otherSettings.payPeriodStartDate = otherSettings.payPeriodStartDate.split('T')[0];
      } 
      // If it's a Date object, convert to YYYY-MM-DD string directly
      else if (otherSettings.payPeriodStartDate instanceof Date) {
        // Use UTC methods to avoid timezone adjustments
        const date = otherSettings.payPeriodStartDate;
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        otherSettings.payPeriodStartDate = `${year}-${month}-${day}`;
      }
      
      console.log('Storing payPeriodStartDate as string:', otherSettings.payPeriodStartDate);
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
            let dateStr: string;
            
            // Handle date as string or Date object
            if (typeof h.date === 'string') {
              // If it's a string with a time component, strip it
              dateStr = h.date.includes('T') ? h.date.split('T')[0] : h.date;
            } else {
              // If it's a Date object, convert to YYYY-MM-DD string using UTC
              const date = h.date;
              const year = date.getUTCFullYear();
              const month = String(date.getUTCMonth() + 1).padStart(2, '0');
              const day = String(date.getUTCDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            }
            
            // Parse the date string to create a Date object for the database
            // This ensures the date is stored correctly without timezone adjustments
            const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
            const localDate = new Date(Date.UTC(year, month - 1, day));
            
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