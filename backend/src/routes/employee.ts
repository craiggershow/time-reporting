import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { authenticate, requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { Router } from 'express';

const router = Router();

// Debug logging middleware
router.use((req, res, next) => {
  console.log('\n=== Employee Router ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  next();
});

// Get all employees (excluding admin users)
// We'll use requireAuth which is more flexible than authenticate
router.get('/', requireAuth, async (req: Request, res: Response) => {
  console.log('\n=== Employees Route Start ===');
  console.log('User:', { id: req.user?.id, role: req.user?.role });
  
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = (req.query.search as string) || '';
    const includeInactive = req.query.includeInactive === 'true';
    
    console.log('Query params:', { page, limit, search, includeInactive });
    
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
    console.log('=== Employees Route End ===\n');
    
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
    console.error('=== Employees Route Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== Employees Route End ===\n');
    
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const employeeRouter = router; 