import { describe, it, expect } from 'vitest';
import { MemoIdSchema, MemoCreateSchema, MemoUpdateSchema } from '../src/schemas/memo.schema';

describe('Memo Zod schemas', () => {
  it('MemoId accepts valid 21-char NanoID and rejects bad IDs', () => {
    expect(() => MemoIdSchema.parse('1'.repeat(21))).not.toThrow();
    expect(() => MemoIdSchema.parse('short')).toThrow();
    expect(() => MemoIdSchema.parse('id-with space____________')).toThrow();
  });

  it('MemoCreate requires non-empty title/body within limits', () => {
    expect(() => MemoCreateSchema.parse({ title: 'Test', body: 'Test' })).not.toThrow();
    expect(() => MemoCreateSchema.parse({ title: '', body: 'Test' })).toThrow();
    expect(() => MemoCreateSchema.parse({ title: 'Test', body: '' })).toThrow();
  });

  it('MemoUpdate allows partials but rejects empty object', () => {
    expect(() => MemoUpdateSchema.parse({ title: 'New' })).not.toThrow();
    expect(() => MemoUpdateSchema.parse({ body: 'Edit' })).not.toThrow();
    expect(() => MemoUpdateSchema.parse({})).toThrow();
  });
});
