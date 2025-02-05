import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.day.deleteMany();
  await prisma.week.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.payPeriod.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kvdental.ca',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password'
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create a pay period
  const payPeriod = await prisma.payPeriod.create({
    data: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-14'),
    },
  });

  console.log('Database has been seeded. 🌱');
  console.log('Admin user created:', admin.email);
  console.log('Pay period created:', payPeriod.startDate, 'to', payPeriod.endDate);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 