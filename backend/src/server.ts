const express = require('express');
import { Request, Response, NextFunction } from 'express-serve-static-core';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { timesheetRouter } from './routes/timesheet';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error';
import { prisma } from './lib/prisma';
import dotenv from 'dotenv';
import { payPeriodRouter } from './routes/payPeriod';
import { app } from './app';

// Load environment variables
dotenv.config();

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8000;

// Add basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware
app.use(cors({
  origin: [
    'http://192.168.2.241:8081',  // Expo development server
    'http://192.168.2.241:19000', // Expo Go app
    'http://192.168.2.241:19006', // Expo web
    'exp://192.168.2.241:19000',  // Expo Go app (exp protocol)
    'http://localhost:19006', // Add localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Add Cookie to allowed headers
}));

// Configure cookie parser with secure settings
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

// Set secure cookie settings
app.set('trust proxy', 1); // trust first proxy

// Debug middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/timesheets', timesheetRouter);
app.use('/api/pay-periods', payPeriodRouter);

// Error handling
app.use(errorHandler);

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to database');

    // Start server
    const server = app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
      console.log('Available routes:');
      console.log('- GET  /api/test');
      console.log('- POST /api/auth/login');
      console.log('- GET  /api/admin');
      console.log('- GET  /api/admin/users');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down...');
      server.close(() => {
        prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 