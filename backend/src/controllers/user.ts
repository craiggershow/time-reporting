import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getProfile(req: Request, res: Response) {
  console.log('\n=== Get Profile Request ===');
  console.log('User:', req.user);

  try {
    if (!req.user) {
      console.log('❌ No user found in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employeeId: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✓ Profile retrieved:', { userId: user.id, role: user.role });
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  console.log('\n=== Get All Users Request ===');
  console.log('Admin user:', req.user);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    console.log(`✓ Retrieved ${users.length} users`);
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
} 