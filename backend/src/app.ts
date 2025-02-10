//import express from 'express';
const express = require('express');
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { timesheetRouter } from './routes/timesheet';
import { adminRouter } from './routes/admin';
import { clientRouter } from './routes/client';
import { errorHandler } from './middleware/error';
import { validateApiKey } from './middleware/apiKey';
import { authenticate, requireAdmin } from './middleware/auth';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/timesheets', timesheetRouter);
app.use('/api/admin', authenticate, requireAdmin, adminRouter);
app.use('/api/client', validateApiKey, clientRouter);

// Error handling
app.use(errorHandler);

export { app }; 