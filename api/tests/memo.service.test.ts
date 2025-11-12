import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoService } from '../src/services/memo.service';
import { createInMemoryMemoRepo } from '../src/repos/memo.repo';

// Deterministic ID generator
const FIXED_IDS = ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'];
let idIndex = 0;
const testIdGen = () => FIXED_IDS[idIndex++ % FIXED_IDS.length];

// Deterministic clock for tests (Jan 1, 2025 UTC)
const START_2025_IN_MS = Date.UTC(2025, 0, 1, 0, 0, 0);
let mockedNowInMs = START_2025_IN_MS;
const testClock = () => mockedNowInMs;

describe('Memo Service layer tests', () => {
  // Align types with whatever repo/service returns
  let repo: ReturnType<typeof createInMemoryMemoRepo>;
  let service: ReturnType<typeof createMemoService>;

  // Create fresh repo and service before each test
  beforeEach(() => {
    idIndex = 0;
    mockedNowInMs = START_2025_IN_MS;
    repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });
    service = createMemoService(repo);
  });

  it('Create a memo via service and persist to repo', async () => {
    const createReturn = await service.create({ title: 'Test title', body: 'Test body' });

    expect(createReturn.id).toBe('id-1');
    expect(createReturn.title).toBe('Test title');
    expect(createReturn.body).toBe('Test body');
    expect(createReturn.version).toBe(1);
    expect(createReturn.createdAt).toBe(new Date(START_2025_IN_MS).toISOString());
    expect(createReturn.updatedAt).toBe(createReturn.createdAt);

    // Confirm persisted
    const fetched = repo.get(createReturn.id)!;
    expect(fetched).toEqual(createReturn);
  });

  it('Test validation on payload', async () => {
    await expect(
      service.create({ title: 'Valid title', body: 'Valid body' }),
    ).resolves.toMatchObject({ title: 'Valid title', body: 'Valid body', version: 1 });

    await expect(service.create({ title: 'Invalid body', body: '' })).rejects.toThrow();

    await expect(service.create({ title: '', body: 'Invalid title' })).rejects.toThrow();

    await expect(service.create({})).rejects.toThrow();
  });

  it('List memos tests for both insertion order and pagination', async () => {
    const createPromises = [];
    for (let testIndex = 0; testIndex < 5; testIndex++) {
      createPromises.push(service.create({ title: `title-${testIndex}`, body: `body-${testIndex}` }));
    }
    await Promise.all(createPromises);

    // Check paginated results for expected titles and metadata
    const page1Data = await service.list({ page: 1, limit: 2 });
    expect(page1Data.data.map((map) => map.title)).toEqual(['title-0', 'title-1']);
    expect(page1Data.total).toBe(5);
    expect(page1Data.page).toBe(1);
    expect(page1Data.limit).toBe(2);
    const page2 = await service.list({ page: 2, limit: 2 });
    expect(page2.data.map((map) => map.title)).toEqual(['title-2', 'title-3']);
    expect(page2.total).toBe(5);
    expect(page2.page).toBe(2);
    expect(page2.limit).toBe(2);
    const page3Data = await service.list({ page: 3, limit: 2 });
    expect(page3Data.data.map((map) => map.title)).toEqual(['title-4']);
    expect(page3Data.total).toBe(5);
    expect(page3Data.page).toBe(3);
    expect(page3Data.limit).toBe(2);

    const page4Data = await service.list({ page: 4, limit: 2 });
    expect(page4Data.data).toEqual([]); // Gracefully handles out-of-bounds page
  });

  it('List memos test for filtering results by query value', async () => {
    await service.create({ title: 'Filter result', body: 'Test1' });
    await service.create({ title: 'Ignored', body: 'Test2' });
    await service.create({ title: 'Test3', body: 'Filter result' });

    const filtered = await service.list({ query: 'fil' });
    expect(filtered.data.map((m) => m.title)).toEqual(['Filter result', 'Test3']);
  });

  it('Get memo by ID returns the entity, or undefined when not found', async () => {
    const created = await service.create({ title: 'Find me', body: 'Lookup' });

    const found = await service.get(created.id);
    expect(found?.id).toBe(created.id);

    const missing = await service.get('missing-id');
    expect(missing).toBeUndefined();
  });

  it('Update an existing memo, bumping version and updatedAt', async () => {
    const created = await service.create({ title: 'Original title', body: 'Body' });

    // Advance mock clock by 5 minutes for updatedAt
    mockedNowInMs = Date.UTC(2025, 0, 1, 0, 5, 0);

    const updated = await service.update(created.id, { title: 'Edited title' })!;
    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.title).toBe('Edited title');
    expect(updated?.body).toBe('Body');
    expect(updated?.version).toBe(2);
    expect(updated?.createdAt).toBe(created.createdAt);
    expect(updated?.updatedAt).toBe(new Date(mockedNowInMs).toISOString());
  });

  it('Update returns undefined when the memo does not exist', async () => {
    const updateReturn = await service.update('missing-id', { title: 'Edited title' });
    expect(updateReturn).toBeUndefined();
  });

  it('Test validation on update payloads', async () => {
    const created = await service.create({ title: 'Test title', body: 'Test body' });
    // Attempt to update with empty payload (invalid)
    expect(service.update(created.id, {})).rejects.toThrow();
  });

  it('Test delete return paths', async () => {
    const created = await service.create({ title: 'Test title', body: 'Test body' });

    // First removal succeeds, returns true, can't fetch once deleted
    expect(service.delete(created.id)).resolves.toBe(true);
    expect(service.get(created.id)).resolves.toBeUndefined();

    // Second removal fails to find entity, returns false
    expect(service.delete(created.id)).resolves.toBe(false);
  });
});
