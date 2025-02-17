import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { DEFAULT_TIMESHEET_SETTINGS, DEFAULT_HOLIDAYS } from '../src/config/defaults';

const prisma = new PrismaClient();

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        employeeId: '000001',
      },
    });
    console.log('Created admin user');
  }

  // Create default settings
  await prisma.settings.upsert({
    where: { key: 'timesheet_settings' },
    update: {
      value: DEFAULT_TIMESHEET_SETTINGS
    },
    create: {
      key: 'timesheet_settings',
      value: DEFAULT_TIMESHEET_SETTINGS
    }
  });

  console.log('Default settings created/updated');

  // Create holidays
  for (const holiday of DEFAULT_HOLIDAYS) {
    await prisma.holiday.upsert({
      where: {
        id: `${holiday.date.toISOString().split('T')[0]}_${holiday.name}`
      },
      update: {
        date: holiday.date,
        name: holiday.name
      },
      create: {
        date: holiday.date,
        name: holiday.name
      }
    });
  }

  console.log('Default holidays created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });