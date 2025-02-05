const express = require('express');
import { Request, Response } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { 
  getCurrentTimesheet,
  getPreviousTimesheet,
  getTimesheet,
  updateTimesheet,
  submitTimesheet,
} from '../controllers/timesheet';
import { validateTimesheet } from '../middleware/validation';

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(authenticate);

router.get('/', async (req: Request & { user: { id: string } }, res: Response) => {
  const timesheets = await prisma.timesheet.findMany({
    where: {
      userId: req.user.id
    },
    include: {
      weeks: {
        include: {
          days: true
        }
      }
    }
  });
  res.json(timesheets);
});

// Debug endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Timesheet router is working' });
});

router.get('/current', getCurrentTimesheet);
router.get('/previous', getPreviousTimesheet);
router.get('/:id', getTimesheet);
router.post('/', validateTimesheet, updateTimesheet);
router.post('/:id/submit', submitTimesheet);

export { router as timesheetRouter }; 