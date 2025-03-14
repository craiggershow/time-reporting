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

router.get('/reports', (req: Request, res: Response) => {
  res.json({ message: 'Generate reports - Not implemented' });
});

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export const adminRouter = router; 