import { prisma } from '../lib/prisma';

export async function getNextEmployeeId(): Promise<string> {
  // Get the highest employee ID
  const highestUser = await prisma.user.findFirst({
    orderBy: {
      employeeId: 'desc',
    },
    select: {
      employeeId: true,
    },
  });

  if (!highestUser) {
    return '000001'; // Start with 1 if no users exist
  }

  // Parse the current highest number and increment
  const currentNumber = parseInt(highestUser.employeeId, 10);
  const nextNumber = currentNumber + 1;
  
  // Pad with leading zeros to maintain 6 digits
  return nextNumber.toString().padStart(6, '0');
} 