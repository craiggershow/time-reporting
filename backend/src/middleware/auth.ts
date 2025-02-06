const express = require('express');
import { Request, Response, NextFunction } from 'express-serve-static-core';

//import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
  };
}

export const authenticate = authMiddleware;

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Debug logging
    console.log('Auth Headers:', req.headers.authorization);
    console.log('Cookies:', req.cookies);
    
    // Check both cookie and Authorization header
    const authHeader = req.headers.authorization;
    const token = req.cookies.auth_token || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader);
    
    console.log('Extracted token:', token?.substring(0, 20) + '...');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('Decoded token:', decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.log('User not found for token:', decoded);
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    console.log('Auth successful for user:', user.id);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
} 