import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password, isAdmin } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check role if attempting admin login
    if (isAdmin && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized for admin access' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { 
        // Convert string to number and ensure it's in seconds
        expiresIn: Number(process.env.JWT_EXPIRES_IN )
      }
    );

    // Set cookie with matching expiration
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_EXPIRES_IN ) * 1000, // Convert seconds to milliseconds
    });

    // Send response
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token // Include token in response for development/testing
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
}

interface ResetRequest extends Request {
  body: {
    email: string;
  };
}

export async function resetPassword(req: ResetRequest, res: Response) {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({ message: 'If your email exists, you will receive reset instructions' });
    }

    // TODO: Implement password reset email functionality
    // For development:
    if (email === 'admin@kvdental.ca') {
      await prisma.user.update({
        where: { email },
        data: { password: await bcrypt.hash('password', 10) }
      });
    }

    res.json({ message: 'If your email exists, you will receive reset instructions' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    // The user object is already attached by the authenticate middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if any admin users exist
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount > 0) {
      return res.status(403).json({ 
        error: 'Admin user already exists. Additional admin users must be created by an existing admin.' 
      });
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

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN',
        employeeId: 'ADMIN001',
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
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 