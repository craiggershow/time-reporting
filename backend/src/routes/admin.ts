//import express from 'express';
const express = require('express');
import { Request, Response } from 'express-serve-static-core';
import { authenticate, requireAdmin } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { getNextEmployeeId } from '../utils/employeeId';

const router = express.Router();

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

// Apply auth middleware to protected routes
router.use(authenticate);
router.use(requireAdmin);

// Protected routes below
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

// Create user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password, role, isActive, employeeId } = req.body;
    
    // If employeeId is not provided, generate a new one
    const actualEmployeeId = employeeId || await getNextEmployeeId();

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password,
        role,
        isActive,
        employeeId: actualEmployeeId,
      },
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
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        role,
        isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', (req: Request, res: Response) => {
  res.json({ message: 'Delete user - Not implemented' });
});

router.get('/timesheets', (req: Request, res: Response) => {
  res.json({ message: 'List timesheets - Not implemented' });
});

router.put('/timesheets/:id', (req: Request, res: Response) => {
  res.json({ message: 'Update timesheet status - Not implemented' });
});

router.get('/reports', (req: Request, res: Response) => {
  res.json({ message: 'Generate reports - Not implemented' });
});

router.put('/settings', (req: Request, res: Response) => {
  res.json({ message: 'Update company settings - Not implemented' });
});

export { router as adminRouter }; 