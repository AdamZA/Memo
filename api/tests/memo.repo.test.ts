import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryMemoRepo } from '../src/repos/memo.repo';

// Defined IDs for testing
const FIXED_IDS = ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'];
let idIndex = 0;
const testIdGen = () => FIXED_IDS[idIndex++ % FIXED_IDS.length];

// Defined clock for tests, set (Jan 1, 2025 UTC)
const START_2025_IN_MS = Date.UTC(2025, 0, 1, 0, 0, 0);
let newCreatedAtValue = START_2025_IN_MS;
const testClock = () => newCreatedAtValue;

describe('In-memory Memo Repository tests', () => {
  // Reset ID index and test clock before each test
  beforeEach(() => {
    idIndex = 0;
    newCreatedAtValue = START_2025_IN_MS;
  });

  it('Create a memo using defined IDs and timestamps', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });

    const createReturn = repo.create({ title: 'Test title', body: 'Test body' });

    expect(createReturn.id).toBe('id-1');
    expect(createReturn.title).toBe('Test title');
    expect(createReturn.body).toBe('Test body');
    expect(createReturn.version).toBe(1);
    expect(createReturn.createdAt).toBe(new Date(START_2025_IN_MS).toISOString());
    expect(createReturn.updatedAt).toBe(createReturn.createdAt);

    // Check fetched Memo matches create result
    const getReturn = repo.get(createReturn.id)!;
    expect(getReturn).toEqual(createReturn);
  });

  it('Test list Memo result with pagination and expected insert order', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });

    for (let testIndex = 0; testIndex < 5; testIndex++) {
      repo.create({ title: `title-${testIndex}`, body: `body-${testIndex}` });
    }

    const page1 = repo.list({ page: 1, limit: 2 });
    expect(page1.total).toBe(5);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);
    expect(page1.data.map((m) => m.title)).toEqual(['title-0', 'title-1']);

    const page2 = repo.list({ page: 2, limit: 2 });
    expect(page2.data.map((m) => m.title)).toEqual(['title-2', 'title-3']);

    const page3 = repo.list({ page: 3, limit: 2 });
    expect(page3.data.map((m) => m.title)).toEqual(['title-4']);

    const page4 = repo.list({ page: 4, limit: 2 });
    expect(page4.data).toEqual([]); // Gracefully handles out-of-bounds page
  });

  it('Test filtering results by query', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });

    repo.create({ title: 'Filter result', body: 'Test1' });
    repo.create({ title: 'Ignored', body: 'Test2' });
    repo.create({ title: 'Test3', body: 'Filter result' });

    const filtered = repo.list({ query: 'fil' });
    expect(filtered.total).toBe(2);
    expect(filtered.data.map((m) => m.title)).toEqual(['Filter result', 'Test3']);
  });

  it('Test Memo update, including versioning and updatedAt values', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });

    const createReturn = repo.create({ title: 'Original', body: 'Body' });

    // New timestamp for update, 5 minutes after mocked createdAt value
    newCreatedAtValue = Date.UTC(2025, 0, 1, 0, 5, 0);
    const updateReturn = repo.update(createReturn.id, { title: 'Renamed' })!;

    expect(updateReturn.id).toBe(createReturn.id);
    expect(updateReturn.title).toBe('Renamed');
    expect(updateReturn.body).toBe('Body');
    expect(updateReturn.version).toBe(2);
    expect(updateReturn.createdAt).toBe(createReturn.createdAt);
    expect(updateReturn.updatedAt).toBe(new Date(newCreatedAtValue).toISOString());
    expect(updateReturn.updatedAt).not.toBe(createReturn.updatedAt);
  });

  it('Test hitting update method with non-existent ID', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });
    const updateReturn = repo.update('missing-id', { title: 'missing' });
    expect(updateReturn).toBeUndefined();
  });

  it('Test delete functionality, and return on both successful delete and entity not found', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });

    const createdReturn = repo.create({ title: 'To remove', body: 'Test' });

    // Entity found, deleted, can't be found on GET following deletion
    expect(repo.delete(createdReturn.id)).toBe(true);
    expect(repo.get(createdReturn.id)).toBeUndefined();

    // Entity not found, nothing deleted
    expect(repo.delete(createdReturn.id)).toBe(false);
  });

  it('Test normalization of pagination bounds', () => {
    const repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });
    for (let testIndex = 0; testIndex < 3; testIndex++)
      repo.create({ title: `title-${testIndex}`, body: `body-${testIndex}` });

    // Boundary test: negative page number, maximum limit exceeded test
    const listReturn = repo.list({ page: -5, limit: 9999 });
    expect(listReturn.page).toBe(1);
    expect(listReturn.limit).toBeLessThanOrEqual(100);
    expect(listReturn.total).toBe(3); // Test total count, regardless of pagination
    expect(listReturn.data.length).toBe(3); // Test returned data count per page
  });
});
