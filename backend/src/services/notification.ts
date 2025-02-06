import { prisma } from '../lib/prisma';
import { sendEmail } from './email';

interface NotificationData {
  timesheetId: string;
  userId: string;
  type: 'SUBMISSION' | 'APPROVAL' | 'REJECTION';
}

export async function createNotification(data: NotificationData) {
  try {
    const { timesheetId, userId, type } = data;

    // Get user and timesheet details
    const [user, timesheet] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.timesheet.findUnique({
        where: { id: timesheetId },
        include: { payPeriod: true },
      }),
    ]);

    if (!user || !timesheet) {
      throw new Error('User or timesheet not found');
    }

    // Get admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });



    // Create notification records
    await prisma.Notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        timesheetId,
        type,
        read: false,
      }))
    });

    // Send email notifications
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Timesheet ${type.toLowerCase()}`,
        text: getNotificationText({ type, user, timesheet }),
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

function getNotificationText({ type, user, timesheet }: any) {
  const baseText = `${user.firstName} ${user.lastName} has`;
  
  switch (type) {
    case 'SUBMISSION':
      return `${baseText} submitted a timesheet for the period ${timesheet.payPeriod.startDate} to ${timesheet.payPeriod.endDate}`;
    case 'APPROVAL':
      return `${baseText} had their timesheet approved`;
    case 'REJECTION':
      return `${baseText} had their timesheet rejected`;
    default:
      return `${baseText} updated their timesheet`;
  }
} 