import express from 'express';
import type { Router } from 'express';
import { loginUser, logoutUser, getCurrentUser } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router: Router = express.Router();

console.log('Mounting auth routes...');

// Public routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

console.log('✓ Auth routes mounted');

export default router; 