import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app';
import { ERROR_MESSAGES } from '../src/constants/errors';

describe('Test error handling for middleware layer', () => {
  const app = createApp({});

  it('POST malformed JSON, expect 400 response', async () => {
    const res = await request(app)
      .post('/memos')
      .set('Content-Type', 'application/json')
      .send('{"--":"json"'); // Malformed JSON (missing closing brace)
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: ERROR_MESSAGES.INVALID_JSON });
  });

  it('GET unsupported route, expect 404 response', async () => {
    const res = await request(app).get('/unsupported-route');
    expect(res.status).toBe(404);
  });

  it('Hit supported route with incorrect method, expect 405 response', async () => {
    const res = await request(app).delete('/memos'); // DELETE not supported on list route
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
    expect(res.headers.allow).toEqual('GET, POST');
  });
});
