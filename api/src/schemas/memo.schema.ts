import { z } from 'zod';

// Enforce NanoID format (21 URL-safe characters)
export const MemoId = z.string().regex(/^[A-Za-z0-9_-]{21}$/, 'Invalid NanoID format');

export const MemoCreate = z.object({
  title: z.string().min(1).max(150).trim(),
  body: z.string().min(1).max(2000).trim(),
});

export const MemoUpdate = z
  .object({
    title: z.string().min(1).max(150).trim().optional(),
    body: z.string().min(1).max(2000).trim().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' });

// Domain types
export type MemoId = z.infer<typeof MemoId>;
export type MemoCreate = z.infer<typeof MemoCreate>;
export type MemoUpdate = z.infer<typeof MemoUpdate>;

export type Memo = {
  id: MemoId;
  title: string;
  body: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  version: number; // define version for ease of optimistic concurrency
};
