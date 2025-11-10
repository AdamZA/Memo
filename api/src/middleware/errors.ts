import { NextFunction, Request, Response } from 'express';
import { PARSE_ERROR_TYPE, ERROR_MESSAGES } from '../constants/errors';
import { HEADERS } from '../constants/payloads';
import { JsonParseError } from '../types/errors';

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
  console.error(err); // TODO: Use more secure error logging
  res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}
