import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { requireAuth } from '../middleware/auth';
import { 
  getCurrentTimesheet,
  submitTimesheet,
  approveTimesheet,
  getAllTimesheets
} from '../controllers/timesheet';

const router = express.Router();

// Debug logging middleware
router.use((req: Request, res: Response, next) => {
  console.log('\n=== Timesheet Router ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  next();
});

// Protect all timesheet routes
router.use(requireAuth);

// Get current user's timesheet
router.get('/current', getCurrentTimesheet);

// Submit timesheet
router.post('/submit', submitTimesheet);

// Admin routes
router.get('/all', getAllTimesheets);
router.post('/:id/approve', approveTimesheet);

export default router; 