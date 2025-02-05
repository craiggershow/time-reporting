import { Request, Response, NextFunction } from 'express-serve-static-core';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
} 