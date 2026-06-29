import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }
  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', details: (err as { keyValue?: unknown }).keyValue });
  }
  console.error('[error]', err);
  const message = err instanceof Error ? err.message : 'Something went wrong';
  res.status(500).json({ message });
}
