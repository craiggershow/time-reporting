import express from 'express';
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

// Debug middleware - add before other middleware
app.use((req, res, next) => {
  console.log('\n=== Request ===');
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Middleware
app.use(cors({
  origin: [
    'http://192.168.2.241:8081',    // Expo development server
    'http://192.168.2.241:19000',   // Expo Go app
    'http://192.168.2.241:19006',   // Expo web
    'exp://192.168.2.241:19000',    // Expo Go app (exp protocol)
    'http://localhost:19006',       // Local development
    'http://localhost:8081',        // Alternative local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));
app.use(express.json());
app.use(cookieParser());

// Test route at root level
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/timesheets', timesheetRouter);
app.use('/api/admin', adminRouter);
app.use('/api/client', clientRouter);

// Error handling
app.use(errorHandler);

export { app }; 