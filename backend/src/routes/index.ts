import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';

// Import routers
import authRouter from './auth';
import userRouter from './user';
import { adminRouter } from './admin';
import timesheetRouter from './timesheet';
import settingsRouter from './settings';
import { payPeriodRouter } from './payPeriod';

const router = express.Router();

console.log('\n=== Initializing Routes ===');

// Mount routers
router.use('/auth', authRouter);
router.use('/users', userRouter); // This will handle /users/me and other user-specific routes
router.use('/admin', adminRouter); // This will handle /admin/users for admin management
router.use('/timesheets', timesheetRouter);
router.use('/settings', settingsRouter);
router.use('/pay-periods', payPeriodRouter);

console.log('✓ Routes initialized');

export default router; 