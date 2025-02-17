import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TimesheetSettings } from '../types/settings';

export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await prisma.settings.findFirst({
      where: { key: 'timesheet_settings' }
    });

    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    });

    // Ensure all settings have default values if not found
    const defaultSettings: TimesheetSettings = {
      payPeriodStartDate: new Date(),
      payPeriodLength: 14,
      maxDailyHours: 15,
      maxWeeklyHours: 50,
      minLunchDuration: 30,
      maxLunchDuration: 60,
      overtimeThreshold: 40,
      doubleTimeThreshold: 60,
      allowFutureTimeEntry: false,
      allowPastTimeEntry: true,
      pastTimeEntryLimit: 14,
      reminderDaysBefore: 2,
      reminderDaysAfter: 1,
      enableEmailReminders: true,
      reminderEmailTemplate: 'Your timesheet for the period {startDate} to {endDate} is due.',
      ccAddresses: [],
      autoApprovalEnabled: false,
      autoApprovalMaxHours: 40,
      requiredApprovers: 1,
      holidayHoursDefault: 8,
      holidayPayMultiplier: 1.5,
    };

    // Merge saved settings with defaults
    const mergedSettings = {
      ...defaultSettings,
      ...(settings?.value || {}),
      holidays,
      // Convert date strings back to Date objects
      payPeriodStartDate: settings?.value?.payPeriodStartDate 
        ? new Date(settings.value.payPeriodStartDate)
        : defaultSettings.payPeriodStartDate,
    };

    res.json(mergedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { holidays, ...otherSettings } = req.body;

    // Validate settings
    const settingsToSave: TimesheetSettings = {
      ...otherSettings,
      payPeriodStartDate: new Date(otherSettings.payPeriodStartDate),
      payPeriodLength: Number(otherSettings.payPeriodLength),
      maxDailyHours: Number(otherSettings.maxDailyHours),
      maxWeeklyHours: Number(otherSettings.maxWeeklyHours),
      minLunchDuration: Number(otherSettings.minLunchDuration),
      maxLunchDuration: Number(otherSettings.maxLunchDuration),
      overtimeThreshold: Number(otherSettings.overtimeThreshold),
      doubleTimeThreshold: Number(otherSettings.doubleTimeThreshold),
      pastTimeEntryLimit: Number(otherSettings.pastTimeEntryLimit),
      reminderDaysBefore: Number(otherSettings.reminderDaysBefore),
      reminderDaysAfter: Number(otherSettings.reminderDaysAfter),
      autoApprovalMaxHours: Number(otherSettings.autoApprovalMaxHours),
      requiredApprovers: Number(otherSettings.requiredApprovers),
      holidayHoursDefault: Number(otherSettings.holidayHoursDefault),
      holidayPayMultiplier: Number(otherSettings.holidayPayMultiplier),
    };

    // Update general settings
    await prisma.settings.upsert({
      where: { key: 'timesheet_settings' },
      update: { value: settingsToSave },
      create: {
        key: 'timesheet_settings',
        value: settingsToSave,
      },
    });

    // Update holidays
    await prisma.holiday.deleteMany();

    if (holidays?.length) {
      await prisma.holiday.createMany({
        data: holidays.map((h: any) => ({
          date: new Date(h.date),
          name: h.name,
          payRate: Number(h.payRate),
        })),
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
} 