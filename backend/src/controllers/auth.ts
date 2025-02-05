import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const signOptions: SignOptions = {
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400'), // 24 hours in seconds
    };

    const token = jwt.sign(payload, jwtSecret, signOptions);

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
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