import { Request, Response, NextFunction } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  console.log('\n=== Auth Middleware Start ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);
  
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      console.log('❌ No auth token found in cookies');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('✓ Token found');
    console.log('Verifying token...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('✓ Token verified');
    console.log('Decoded payload:', { ...decoded, token: '[REDACTED]' });
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('✓ User found:', { id: user.id, role: user.role });
    req.user = user;
    console.log('=== Auth Middleware End ===\n');
    next();
  } catch (error) {
    console.error('=== Auth Middleware Error ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== Auth Middleware End ===\n');
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('\n=== Admin Check Start ===');
  console.log('User:', req.user);
  
  if (req.user?.role !== 'ADMIN') {
    console.log('❌ Access denied - not admin');
    console.log('User role:', req.user?.role);
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  console.log('✓ Admin access granted');
  console.log('=== Admin Check End ===\n');
  next();
} 