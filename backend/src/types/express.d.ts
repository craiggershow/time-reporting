import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'ADMIN' | 'EMPLOYEE';
      };
    }
  }
}

// This is important for the file to be treated as a module
export {}; 