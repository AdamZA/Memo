import { describe, it, expect } from 'vitest';
import { MemoListQuerySchema } from '../src/schemas/memo.list.schema';

describe('MemoListQuerySchema tests', () => {
  it('Test that numeric strings and floats are caught at a schema level', () => {
    expect(() => MemoListQuerySchema.parse({ page: '2.9', limit: 15.2, query: 'abc' })).toThrow();
  });

  it('Test whitespace trimming', () => {
    const parsed = MemoListQuerySchema.parse({ query: '  Fil  ' });
    expect(parsed).toEqual({ query: 'Fil' });
  });

  it('Test that non-numbers are caught at a schema level', () => {
    expect(() =>
      MemoListQuerySchema.parse({ page: 'not-a-number', limit: 'invalid-limit' }),
    ).toThrow();
  });

  it('Test that invalid numbers are caught at schema level', () => {
    expect(() => MemoListQuerySchema.parse({ page: '-5', limit: '-1' })).toThrow();
  });

  it('Test allowing of absent params as they are optional', () => {
    const parsed = MemoListQuerySchema.parse({});
    expect(parsed).toEqual({});
  });

  it('Test that undefined keys are omitted in the resultant parsed object', () => {
    const parsed = MemoListQuerySchema.parse({
      page: undefined,
      limit: undefined,
      query: undefined,
    });
    expect(parsed).toEqual({});
  });
});
