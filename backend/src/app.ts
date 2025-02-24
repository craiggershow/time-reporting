import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';  // API routes
import { errorHandler } from './middleware/error';
import { validateApiKey } from './middleware/apiKey';
import { authenticate, requireAdmin } from './middleware/auth';
import settingsRoutes from './routes/settings';
import authRoutes from './routes/auth';

const app: Application = express();

// Debug middleware - add before other middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== Incoming Request ===');
  console.log('Timestamp:', new Date().toISOString());
  //console.log('Method:', req.method);
  console.log('Path:', req.path);
  //console.log('Origin:', req.headers.origin);
  //console.log('Headers:', {
  //  ...req.headers,
  //  cookie: req.headers.cookie ? '[PRESENT]' : '[NONE]',
  //  authorization: req.headers.authorization ? '[PRESENT]' : '[NONE]'
  //});
  
  // Log response data
  const oldSend = res.send;
  res.send = function(data) {
    //console.log('\n=== Outgoing Response ===');
    //console.log('Status:', res.statusCode);
    //console.log('Headers:', res.getHeaders());
    //console.log('Body:', typeof data === 'string' ? data : '[OBJECT]');
    //console.log('Body: surpressed in app.ts');
    return oldSend.apply(res, arguments as any);
  };
  
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://192.168.2.241:8081',    // Expo development server
  'http://192.168.2.241:19000',   // Expo Go app
  'http://192.168.2.241:19006',   // Expo web
  'exp://192.168.2.241:19000',    // Expo Go app (exp protocol)
  'http://localhost:8081',         // Local development
  'http://localhost:19000',
  'http://localhost:19006',
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware - add before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware to log request body
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST') {
//    console.log('Request body:', {
//      ...req.body,
//      password: req.body.password ? '[REDACTED]' : undefined
//    });
  }
  next();
});

// Test route at root level
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'API is working' });
});

// Mount routes in correct order
app.use('/api/auth', authRoutes);      // Auth routes first
app.use('/api/settings', settingsRoutes); // Settings routes
app.use('/api', apiRoutes);            // Other API routes

//console.log('Routes mounted:');
//console.log('- /api/auth/*');
//console.log('- /api/settings/*');
//console.log('- /api/*');

// Error handling
app.use(errorHandler);

export { app }; 