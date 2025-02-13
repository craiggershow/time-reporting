import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

  // Create test employee if it doesn't exist
  const employeeEmail = 'employee@example.com';
  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail }
  });

  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: employeeEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Employee',
        role: 'EMPLOYEE',
        employeeId: '000002',
      },
    });
    console.log('Created employee user');
  }

  // Create initial pay period setting if it doesn't exist
  const payPeriodSetting = await prisma.setting.findUnique({
    where: { key: 'pay_period_start' }
  });

  if (!payPeriodSetting) {
    // Set to first Monday of current year
    const currentYear = new Date().getFullYear();
    const firstMonday = new Date(currentYear, 0, 1);
    while (firstMonday.getDay() !== 1) { // 1 is Monday
      firstMonday.setDate(firstMonday.getDate() + 1);
    }

    await prisma.setting.create({
      data: {
        key: 'pay_period_start',
        value: firstMonday.toISOString(),
      },
    });
    console.log('Created pay period setting');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });