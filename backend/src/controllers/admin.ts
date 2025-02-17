import { Request, Response } from 'express';
import { processAndSaveImage } from '../utils/storage';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

export async function uploadLogo(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname); // Debug log

    const filename = await processAndSaveImage(req.file);
    console.log('File processed:', filename); // Debug log
    
    // Save logo URL to settings
    await prisma.settings.upsert({
      where: { key: 'company_logo' },
      update: { value: filename },
      create: {
        key: 'company_logo',
        value: filename,
      },
    });

    const logoUrl = `/uploads/${filename}`;
    console.log('Logo URL:', logoUrl); // Debug log
    
    res.json({ logoUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ 
      error: 'Failed to upload logo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await prisma.settings.findMany();
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({
      name: formattedSettings.company_name || '',
      logo: formattedSettings.company_logo ? `/uploads/${formattedSettings.company_logo}` : null,
      payPeriodStart: formattedSettings.pay_period_start || null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, role, employeeId } = req.body;

    // Only allow creating EMPLOYEE users from admin panel
    if (role !== 'EMPLOYEE') {
      return res.status(400).json({ error: 'Can only create employee users' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        employeeId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employeeId: true,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 