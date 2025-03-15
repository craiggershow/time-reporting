import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { authenticate, requireAdmin } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { getNextEmployeeId } from '../utils/employeeId';
import { getSettings, updateSettings } from '../controllers/settings';
import { Router } from 'express';
import { createUser, updateUser, deleteUser } from '../controllers/admin/users';

const router = Router();

// Debug logging middleware
router.use((req, res, next) => {
  console.log('\n=== Admin Router ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  next();
});

// Root route - must come before auth middleware
router.get('/', (req: Request, res: Response) => {
  console.log('Hit admin root route');
  res.json({ message: 'Admin router is mounted correctly' });
});

// Test route - must come before auth middleware
router.get('/test', (req: Request, res: Response) => {
  console.log('Hit admin test route');
  res.json({ message: 'Admin router is working' });
});

// Protect all admin routes with authentication and admin check
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/users', async (req: Request, res: Response) => {
  console.log('\n=== Admin Users Route Start ===');
  console.log('User:', { id: req.user?.id, role: req.user?.role });
  
  try {
    console.log('Fetching users from database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    
    console.log('✓ Users fetched successfully');
    console.log('Users count:', users.length);
    console.log('First user sample:', users[0]);
    console.log('=== Admin Users Route End ===\n');
    
    res.json(users);
  } catch (error) {
    console.error('=== Admin Users Route Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== Admin Users Route End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Employees endpoint - optimized for report filters
router.get('/employees', async (req: Request, res: Response) => {
  console.log('\n=== Admin Employees Route Start ===');
  
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = (req.query.search as string) || '';
    const includeInactive = req.query.includeInactive === 'true';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      role: 'EMPLOYEE', // Exclude admin users
    };
    
    // Only include active users unless specifically requested
    if (!includeInactive) {
      where.isActive = true;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });
    
    // Fetch employees with pagination
    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      skip,
      take: limit,
    });
    
    // Format response
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      isActive: emp.isActive,
    }));
    
    console.log(`✓ Fetched ${employees.length} employees (total: ${totalCount})`);
    console.log('=== Admin Employees Route End ===\n');
    
    res.json({
      employees: formattedEmployees,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('=== Admin Employees Route Error ===');
    console.error('Error:', error);
    console.error('=== Admin Employees Route End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/timesheets', (req: Request, res: Response) => {
  console.log('Hit admin timesheets route');
  res.json({ message: 'List timesheets - Not implemented' });
});

router.put('/timesheets/:id', (req: Request, res: Response) => {
  res.json({ message: 'Update timesheet status - Not implemented' });
});

// Reports endpoint - handles both POST requests
router.post('/reports', async (req: Request, res: Response) => {
  console.log('\n=== Admin Reports Route Start ===');
  console.log('User:', { id: req.user?.id, role: req.user?.role });
  console.log('Request Body:', req.body);
  
  try {
    const {
      startDate,
      endDate,
      employeeIds,
      reportType = 'summary',
      includeInactive = false,
      payPeriodId,
      dateRangeType,
    } = req.body;
    
    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    // Parse dates
    const parsedStartDate = new Date(`${startDate}T00:00:00Z`);
    const parsedEndDate = new Date(`${endDate}T23:59:59Z`);
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Debug log for employee IDs
    console.log('Employee IDs received:', employeeIds);
    console.log('Date range:', { startDate, endDate });
    console.log('Parsed date range:', { 
      parsedStartDate: parsedStartDate.toISOString(), 
      parsedEndDate: parsedEndDate.toISOString() 
    });
    
    // First, let's check if the specific timesheet exists
    if (employeeIds && employeeIds.length === 1) {
      const userId = employeeIds[0];
      console.log(`Checking for timesheets with userId: ${userId}`);
      
      const allUserTimesheets = await prisma.timesheet.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          status: true,
          submittedAt: true,
        }
      });
      
      console.log(`Found ${allUserTimesheets.length} timesheets for user ${userId}:`);
      console.log(JSON.stringify(allUserTimesheets, null, 2));
    }
    
    // Build where clause for timesheets - more lenient for debugging
    const where: any = {};
    
    // Add employee filter if provided
    if (employeeIds && employeeIds.length > 0) {
      where.userId = {
        in: employeeIds,
      };
      console.log('Filtering by user IDs:', employeeIds);
    }
    
    // Include inactive employees filter
    if (!includeInactive) {
      where.user = {
        isActive: true,
      };
    }
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    // Fetch timesheets based on filters
    const timesheets = await prisma.timesheet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            isActive: true,
          },
        },
        weeks: {
          include: {
            days: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
    
    console.log(`Found ${timesheets.length} timesheets`);
    
    // Log timesheet IDs for debugging
    if (timesheets.length > 0) {
      console.log('Timesheet IDs found:');
      timesheets.forEach(ts => {
        console.log(`- ${ts.id} (User: ${ts.userId}, Status: ${ts.status}, Submitted: ${ts.submittedAt})`);
      });
    }
    
    // If no timesheets found, return empty result
    if (timesheets.length === 0) {
      console.log('No timesheets found for the given criteria');
      
      // For debugging, let's try a more lenient query
      const allTimesheets = await prisma.timesheet.findMany({
        where: employeeIds && employeeIds.length > 0 ? { userId: { in: employeeIds } } : {},
        select: {
          id: true,
          userId: true,
          status: true,
          submittedAt: true,
        },
        take: 5,
      });
      
      console.log('Sample of available timesheets:');
      console.log(JSON.stringify(allTimesheets, null, 2));
      
      console.log('=== Admin Reports Route End ===\n');
      
      return res.json({
        items: [],
        meta: {
          startDate,
          endDate,
          reportType,
          totalItems: 0,
        }
      });
    }
    
    // Process timesheets into report format
    let reportItems = [];
    
    if (reportType === 'summary') {
      // Group by employee and sum hours
      const employeeSummary = new Map();
      
      for (const timesheet of timesheets) {
        const employeeId = timesheet.userId;
        const employeeName = `${timesheet.user.firstName} ${timesheet.user.lastName}`;
        
        let regularHours = 0;
        let overtimeHours = 0;
        
        // Sum hours from all weeks and days
        for (const week of timesheet.weeks) {
          // Add extra hours to overtime
          overtimeHours += week.extraHours || 0;
          
          // Sum regular hours from days
          for (const day of week.days) {
            regularHours += day.totalHours || 0;
          }
        }
        
        // Add vacation hours to regular hours
        regularHours += timesheet.vacationHours || 0;
        
        // Update or create employee summary
        if (employeeSummary.has(employeeId)) {
          const summary = employeeSummary.get(employeeId);
          summary.regularHours += regularHours;
          summary.overtimeHours += overtimeHours;
          summary.totalHours += (regularHours + overtimeHours);
        } else {
          employeeSummary.set(employeeId, {
            id: employeeId,
            employeeId: timesheet.user.employeeId,
            employeeName,
            regularHours,
            overtimeHours,
            totalHours: regularHours + overtimeHours,
            isActive: timesheet.user.isActive,
          });
        }
      }
      
      reportItems = Array.from(employeeSummary.values());
      console.log(`Generated ${reportItems.length} summary items`);
    } else {
      // Detailed report - show each day
      for (const timesheet of timesheets) {
        const employeeName = `${timesheet.user.firstName} ${timesheet.user.lastName}`;
        
        // Add entries for each day
        for (const week of timesheet.weeks) {
          // Use timesheet submission date as a fallback, or current date if null
          const weekStartDate = new Date(timesheet.submittedAt || new Date());
          
          for (const day of week.days) {
            if (day.totalHours > 0) {
              // Convert dayOfWeek enum to date
              const dayDate = new Date(weekStartDate);
              
              // Map day of week to day number (0-6)
              const dayMap: Record<string, number> = {
                'MONDAY': 0,
                'TUESDAY': 1,
                'WEDNESDAY': 2,
                'THURSDAY': 3,
                'FRIDAY': 4,
                'SATURDAY': 5,
                'SUNDAY': 6
              };
              
              dayDate.setDate(dayDate.getDate() + dayMap[day.dayOfWeek]);
              
              reportItems.push({
                id: `${timesheet.id}-${week.id}-${day.id}`,
                date: dayDate.toISOString().split('T')[0],
                employeeId: timesheet.user.employeeId,
                employeeName,
                totalHours: day.totalHours,
                dayType: day.dayType,
                isActive: timesheet.user.isActive,
              });
            }
          }
          
          // Add extra hours as a separate entry if present
          if (week.extraHours > 0) {
            const weekEndDate = new Date(timesheet.submittedAt || new Date());
            weekEndDate.setDate(weekEndDate.getDate() + 4); // Friday
            
            reportItems.push({
              id: `${timesheet.id}-${week.id}-extra`,
              date: weekEndDate.toISOString().split('T')[0],
              employeeId: timesheet.user.employeeId,
              employeeName,
              totalHours: week.extraHours,
              dayType: 'OVERTIME',
              isActive: timesheet.user.isActive,
            });
          }
        }
        
        // Add vacation hours as a separate entry if present
        if (timesheet.vacationHours > 0) {
          reportItems.push({
            id: `${timesheet.id}-vacation`,
            date: parsedEndDate.toISOString().split('T')[0],
            employeeId: timesheet.user.employeeId,
            employeeName,
            totalHours: timesheet.vacationHours,
            dayType: 'VACATION',
            isActive: timesheet.user.isActive,
          });
        }
      }
      
      // Sort by date and then by employee name
      reportItems.sort((a, b) => {
        if (a.date === b.date) {
          return a.employeeName.localeCompare(b.employeeName);
        }
        return a.date.localeCompare(b.date);
      });
      
      console.log(`Generated ${reportItems.length} detailed items`);
    }
    
    console.log('=== Admin Reports Route End ===\n');
    
    res.json({
      items: reportItems,
      meta: {
        startDate,
        endDate,
        reportType,
        totalItems: reportItems.length,
      }
    });
  } catch (error) {
    console.error('=== Admin Reports Route Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== Admin Reports Route End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export const adminRouter = router; 