import { Request, Response, NextFunction } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('Decoded token:', decoded); // Debug log
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId // Match the userId from JWT
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.log('User not found for id:', decoded.userId); // Debug log
      return res.status(401).json({ error: 'User not found' });
    }

    // Set user info using the global Express.Request type
    req.user = {
      id: user.id, // Use id consistently in the request object
      email: user.email,
      role: user.role,
    };

    console.log('Auth successful for user:', user.id); // Debug log
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
} 