import { Request, Response, NextFunction } from 'express';
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('✓ Token verified');
    console.log('Decoded payload:', { ...decoded, token: '[REDACTED]' });
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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