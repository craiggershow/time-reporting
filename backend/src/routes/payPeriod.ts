const express = require('express');
import { Request, Response } from 'express-serve-static-core';
import { getCurrentPayPeriod, createPayPeriod, listPayPeriods } from '../controllers/payPeriod';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/current', getCurrentPayPeriod);

// Protected routes
router.use(authenticate);
router.get('/', listPayPeriods);

// Admin only routes
router.use(requireAdmin);
router.post('/', createPayPeriod);

export { router as payPeriodRouter }; 