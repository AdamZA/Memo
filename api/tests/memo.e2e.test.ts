import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createInMemoryMemoRepo } from '../src/repos/memo.repo';
import { createMemoService } from '../src/services/memo.service';
import { ERROR_MESSAGES } from '../src/constants/errors';

// Deterministic IDs for tests
const FIXED_IDS = ['1'.repeat(21), '2'.repeat(21), '3'.repeat(21), '4'.repeat(21), '5'.repeat(21)];
let idIndex = 0;
const testIdGen = () => FIXED_IDS[idIndex++ % FIXED_IDS.length];

// Deterministic clock (Jan 1, 2025 UTC)
const START_2025_IN_MS = Date.UTC(2025, 0, 1, 0, 0, 0);
let mockedNowInMs = START_2025_IN_MS;
const testClock = () => mockedNowInMs;

describe('Read-only /memos routes (GET)', () => {
  let repo: ReturnType<typeof createInMemoryMemoRepo>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    idIndex = 0;
    mockedNowInMs = START_2025_IN_MS;
    repo = createInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });
    const service = createMemoService(repo);
    app = createApp({ repo, service });

    // Seed with 3 memos
    service.create({ title: 'Memo 0', body: 'Body 0' });
    service.create({ title: 'Memo 1', body: 'Body 1' });
    service.create({ title: 'Memo 2', body: 'Body 2' });
  });

  it('GET /memos returns paginated list with headers + metadata', async () => {
    const res = await request(app).get('/memos?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBe('3');
    expect(res.body.total).toBe(3);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.data.map((m: any) => m.title)).toEqual(['Memo 0', 'Memo 1']);
  });

  it('GET /memos supports query filtering', async () => {
    const res = await request(app).get('/memos?query=2');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe('Memo 2');
  });

  it('GET /memos normalizes bad paging inputs', async () => {
    const res = await request(app).get('/memos?page=-9&limit=9999');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBeLessThanOrEqual(100);
  });

  it('GET /memos/:id returns memo when found', async () => {
    const list = await request(app).get('/memos');
    const id = list.body.data[0].id;

    const res = await request(app).get(`/memos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.title).toBe('Memo 0');
  });

  it('GET /memos/:id returns 404 when not found', async () => {
    const res = await request(app).get('/memos/' + '6'.repeat(21));
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
  });

  it('GET /memos with invalid query params returns 400 (Zod)', async () => {
    const res = await request(app).get('/memos?page=not-a-number');
    expect(res.status).toBe(400);
  });

  it('GET /memos query is case-insensitive and handles whitespace', async () => {
    const res = await request(app).get('/memos?query=  memo  ');
    expect(res.status).toBe(200);

    expect(res.body.total).toBe(3);
    const titles = res.body.data.map((m: any) => m.title);
    expect(titles).toContain('Memo 0');
    expect(titles).toContain('Memo 1');
    expect(titles).toContain('Memo 2');
  });

  it('GET /memos query that matches nothing returns empty data', async () => {
    const res = await request(app).get('/memos?query=nomatches');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.data).toEqual([]);
  });
});
