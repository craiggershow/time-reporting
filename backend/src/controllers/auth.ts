import { Request, Response } from 'express';
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

export async function loginUser(req: Request, res: Response) {
  console.log('\n=== Login Request ===');
  console.log('Headers:', {
    ...req.headers,
    authorization: req.headers.authorization ? '[PRESENT]' : '[NONE]',
    cookie: req.headers.cookie ? '[PRESENT]' : '[NONE]'
  });
  console.log('Body:', { ...req.body, password: '[REDACTED]' });
  console.log('Content-Type:', req.headers['content-type']);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing credentials:', { 
        hasEmail: !!email, 
        hasPassword: !!password,
        body: req.body
      });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
      }
    });

    console.log('User lookup result:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    } : 'Not found');

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password validation:', isValid ? '✓ Valid' : '❌ Invalid');

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('✓ Token generated');

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log('✓ Cookie set');
    console.log('Response headers:', res.getHeaders());

    const response = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    console.log('✓ Sending response:', { ...response, token: '[REDACTED]' });
    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
}

interface ResetRequest extends Request {
  body: {
    email: string;
  };
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
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
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user information' });
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