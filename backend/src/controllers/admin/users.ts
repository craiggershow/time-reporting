import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';

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

// ... other user management functions ... 