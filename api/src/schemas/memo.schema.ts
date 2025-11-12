import { z } from 'zod';
import { SCHEMA_ERROR_MESSAGES } from '../constants/errors';

// Enforce NanoID format (21 URL-safe characters)
export const MemoIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{21}$/, SCHEMA_ERROR_MESSAGES.INVALID_ID);

// Base schema for creating and updating memos
// Contains the core fields that can be set/modified (title and body)
export const MemoBaseSchema = z.object({
  title: z.string().min(1).max(150).trim(),
  body: z.string().min(1).max(2000).trim(),
});

// Create and Update schemas
export const MemoCreateSchema = MemoBaseSchema;

export const MemoUpdateSchema = MemoBaseSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: SCHEMA_ERROR_MESSAGES.EMPTY_UPDATE },
);

// Full Memo schema including metadata
export const MemoSchema = MemoBaseSchema.extend({
  id: MemoIdSchema,
  createdAt: z.iso.datetime(), // z.iso is available in zod >= v3.20.0
  updatedAt: z.iso.datetime(),
  version: z.number().int().min(1),
});

// Typescript types
export type Memo = z.infer<typeof MemoSchema>;
export type MemoId = z.infer<typeof MemoIdSchema>;
export type MemoCreate = z.infer<typeof MemoCreateSchema>;
export type MemoUpdate = z.infer<typeof MemoUpdateSchema>;
