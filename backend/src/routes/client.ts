const express = require('express');
import { Request as ExpressRequest, Response as ExpressResponse } from 'express-serve-static-core';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Client routes
router.get('/timesheets', async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const timesheets = await prisma.timesheet.findMany({
      include: {
        weeks: {
          include: {
            days: true
          }
        }
      }
    });
    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as clientRouter }; 