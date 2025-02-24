import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getSettings, updateSettings } from '../controllers/settings';

const router = express.Router();

console.log('Mounting settings routes...');

// Read settings - available to all authenticated users
router.get('/', requireAuth, getSettings);

// Update settings - only available to admin users
router.put('/', requireAuth, requireAdmin, updateSettings);

console.log('✓ Settings routes mounted');

export default router; 