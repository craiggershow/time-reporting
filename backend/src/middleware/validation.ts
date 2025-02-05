import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express-serve-static-core';
import { z } from 'zod';

interface ValidationRequest extends ExpressRequest {
  body: Record<string, any>;
}

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const daySchema = z.object({
  dayType: z.enum(['REGULAR', 'VACATION', 'SICK', 'HOLIDAY']),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  lunchStartTime: z.string().nullable(),
  lunchEndTime: z.string().nullable(),
  totalHours: z.number(),
});

const weekSchema = z.object({
  extraHours: z.number(),
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
});

const timesheetSchema = z.object({
  week1: weekSchema,
  week2: weekSchema,
  vacationHours: z.number(),
});

export function validateLogin(req: ValidationRequest, res: ExpressResponse, next: NextFunction) {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      next(error);
    }
  }
}

export function validateResetPassword(req: ValidationRequest, res: ExpressResponse, next: NextFunction) {
  try {
    resetPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      next(error);
    }
  }
}

export function validateTimesheet(req: ValidationRequest, res: ExpressResponse, next: NextFunction) {
  try {
    timesheetSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      next(error);
    }
  }
} 