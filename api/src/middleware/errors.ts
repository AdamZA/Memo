import { NextFunction, Request, Response } from 'express';
import { PARSE_ERROR_TYPE, ERROR_MESSAGES } from '../constants/errors';
import { HEADERS } from '../constants/payloads';
import { JsonParseError } from '../types/errors';
import { ZodError } from 'zod';
import { formatZodError } from '../utils/formatters';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND });
}

export function methodNotAllowed(allowed: string[]) {
  return (_req: Request, res: Response) => {
    res.setHeader(HEADERS.ALLOW, allowed.join(', '));
    res.status(405).json({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  };
}

export function badJson(err: JsonParseError, _req: Request, res: Response, next: NextFunction) {
  if (err?.type === PARSE_ERROR_TYPE) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_JSON });
  }
  return next(err);
}

// Using any type here because this is a general error handler
export function generalError(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: ERROR_MESSAGES.VALIDATION_FAILED,
      details: formatZodError(err),
    });
  }

  console.error(ERROR_MESSAGES.UNEXPECTED_ERROR, err);
  return res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}
