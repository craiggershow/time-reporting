declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'ADMIN' | 'EMPLOYEE';
      };
    }
  }
}

// This is important for the file to be treated as a module
export {}; 