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

// Load environment variables
dotenv.config();

const app = express();
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
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

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

// Start server
const server = app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log('Available routes:');
  console.log(`- GET http://${host}:${port}/health`);
  console.log(`- GET http://${host}:${port}/api/timesheets/current`);
  console.log(`- GET http://${host}:${port}/api/timesheets/previous`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit();
  });
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 