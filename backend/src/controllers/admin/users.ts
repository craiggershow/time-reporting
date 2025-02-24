import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { getNextEmployeeId } from '../../utils/employeeId';

export async function createUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, role, employeeId } = req.body;

    // Only allow creating EMPLOYEE users from admin panel
    if (role !== 'EMPLOYEE') {
      return res.status(400).json({ error: 'Can only create employee users' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Store the hashed password
        firstName,
        lastName,
        role,
        employeeId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employeeId: true,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  console.log('\n=== Admin Update User Route ===');
  console.log('Request Params:', req.params);
  console.log('Request Body:', req.body);
  
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
}

export async function deleteUser(req: Request, res: Response) {
  console.log('\n=== Admin Delete User Route ===');
  console.log('Request Params:', req.params);
  
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// ... other user management functions ... 