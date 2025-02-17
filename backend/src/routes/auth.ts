import { Router } from 'express';
import { login, logout, getCurrentUser, register } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/register', register);

// Debug endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Auth router is working' });
});

export const authRouter = router; 