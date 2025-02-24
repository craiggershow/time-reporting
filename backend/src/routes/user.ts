import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile } from '../controllers/user';

const router = express.Router();

// Routes for individual user operations
router.get('/me', requireAuth, getProfile); // For getting current user's profile

export default router; 