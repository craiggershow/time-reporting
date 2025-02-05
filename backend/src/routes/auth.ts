const express = require('express');
import { Request, Response } from 'express-serve-static-core';
import { login, logout } from '../controllers/auth';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);

// Debug endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Auth router is working' });
});

export { router as authRouter }; 