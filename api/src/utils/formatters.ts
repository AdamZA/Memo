import { ZodError } from 'zod';

// Utility to format ZodError into a more readable structure
export function formatZodError(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join('.'),
    code: i.code,
    message: i.message,
  }));
}
