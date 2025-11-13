import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createAsyncInMemoryMemoRepo } from '../src/repos/memo.repo';
import { createAsyncMemoService } from '../src/services/memo.service';
import { ERROR_MESSAGES } from '../src/constants/errors';

// Deterministic IDs for tests
const FIXED_IDS = ['1'.repeat(21), '2'.repeat(21), '3'.repeat(21), '4'.repeat(21), '5'.repeat(21)];
let idIndex = 0;
const testIdGen = () => FIXED_IDS[idIndex++ % FIXED_IDS.length];

// Deterministic clock (Jan 1, 2025 UTC)
const START_2025_IN_MS = Date.UTC(2025, 0, 1, 0, 0, 0);
let mockedNowInMs = START_2025_IN_MS;
const testClock = () => mockedNowInMs;

describe('Memo read-only routes (GET)', () => {
  let repo: ReturnType<typeof createAsyncInMemoryMemoRepo>;
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    idIndex = 0;
    mockedNowInMs = START_2025_IN_MS;
    repo = createAsyncInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });
    const service = createAsyncMemoService(repo);
    app = createApp({ service }); // Only service needed, as it relies on repo internally

    // Seed with 3 memos
    await service.create({ title: 'Memo 0', body: 'Body 0' });
    await service.create({ title: 'Memo 1', body: 'Body 1' });
    await service.create({ title: 'Memo 2', body: 'Body 2' });
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

  it('GET /memos with invalid query values', async () => {
    const res = await request(app).get('/memos?page=-9&limit=9999');
    expect(res.status).toBe(400);
    expect(res.body.page).toBeUndefined();
    expect(res.body.limit).toBeUndefined();
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

describe('Memo mutation routes (POST/PUT/DELETE)', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    idIndex = 0;
    mockedNowInMs = START_2025_IN_MS;

    const repo = createAsyncInMemoryMemoRepo({ idGen: testIdGen, clock: testClock });
    const service = createAsyncMemoService(repo);

    app = createApp({ service }); // Only service needed, as it relies on repo internally
  });

  it('POST /memos creates a memo and returns 201 with body', async () => {
    const createResponse = await request(app)
      .post('/memos')
      .send({ title: 'Test title', body: 'Test body' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBe('1'.repeat(21));
    expect(createResponse.body.title).toBe('Test title');
    expect(createResponse.body.body).toBe('Test body');
    expect(createResponse.body.version).toBe(1);
    expect(createResponse.body.createdAt).toBeDefined();
    expect(createResponse.body.updatedAt).toBeDefined();
  });

  it('POST /memos rejects invalid payload with 400', async () => {
    const invalidCreateResponse = await request(app).post('/memos').send({ title: '', body: '' }); // Violates MemoCreateSchema

    expect(invalidCreateResponse.status).toBe(400);
    expect(invalidCreateResponse.body.error).toBe(ERROR_MESSAGES.VALIDATION_FAILED); // generalError uses this wording
    expect(Array.isArray(invalidCreateResponse.body.details)).toBe(true);
  });

  it('PUT /memos/:id updates existing memo and bumps version', async () => {
    // Create initial memo
    const createResponse = await request(app)
      .post('/memos')
      .send({ title: 'Original', body: 'Body' });

    const id = createResponse.body.id;

    // Advance mock time by 5 minutes for updatedAt
    mockedNowInMs = Date.UTC(2025, 0, 1, 0, 5, 0);

    const updateRes = await request(app).put(`/memos/${id}`).send({ title: 'Edited' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.id).toBe(id);
    expect(updateRes.body.title).toBe('Edited');
    expect(updateRes.body.body).toBe('Body');
    expect(updateRes.body.version).toBe(2);
    expect(updateRes.body.updatedAt).not.toBe(createResponse.body.updatedAt);
  });

  it('PUT /memos/:id rejects empty update payload with 400', async () => {
    const createResponse = await request(app)
      .post('/memos')
      .send({ title: 'Original', body: 'Body' });

    const id = createResponse.body.id;

    const invalidUpdateResponse = await request(app).put(`/memos/${id}`).send({}); // MemoUpdateSchema should reject

    expect(invalidUpdateResponse.status).toBe(400);
    expect(invalidUpdateResponse.body.error).toBe(ERROR_MESSAGES.VALIDATION_FAILED);
  });

  it('PUT /memos/:id returns 404 when memo is not found', async () => {
    const missingId = '9'.repeat(21);

    const invalidUpdateResponse = await request(app)
      .put(`/memos/${missingId}`)
      .send({ title: 'Test' });

    expect(invalidUpdateResponse.status).toBe(404);
    expect(invalidUpdateResponse.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
  });

  it('DELETE /memos/:id returns 204 on successful delete', async () => {
    const createResponse = await request(app)
      .post('/memos')
      .send({ title: 'Delete me', body: 'Body' });

    const id = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/memos/${id}`);
    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.body).toEqual({}); // No body on 204

    // Subsequent GET should 404
    const getResponse = await request(app).get(`/memos/${id}`);
    expect(getResponse.status).toBe(404);
  });

  it('DELETE /memos/:id returns 404 when memo not found', async () => {
    const missingId = '9'.repeat(21);

    const deleteResponse = await request(app).delete(`/memos/${missingId}`);
    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
  });
});
