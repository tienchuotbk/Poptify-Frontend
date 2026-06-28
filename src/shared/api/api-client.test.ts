import { describe, it, expect, vi } from 'vitest';
import { createApiClient } from './api-client';
import { ApiError } from './api-error';

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('createApiClient', () => {
  it('GET parses JSON', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(200, [{ id: 1 }]));
    const client = createApiClient(fetcher);
    const data = await client.get<{ id: number }[]>('/api/popups');
    expect(data).toEqual([{ id: 1 }]);
    expect(fetcher).toHaveBeenCalledWith('/api/popups', expect.objectContaining({ method: 'GET' }));
  });

  it('POST sends JSON body + content-type and returns created', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(201, { id: 9, name: 'x' }));
    const client = createApiClient(fetcher);
    const data = await client.post<{ id: number }>('/api/popups', { name: 'x' });
    expect(data).toEqual({ id: 9, name: 'x' });
    const [, init] = fetcher.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'x' }));
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('DELETE handles 204 No Content', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient(fetcher);
    await expect(client.del('/api/popups/1')).resolves.toBeUndefined();
  });

  it('throws ApiError with parsed messages on 400', async () => {
    // mockImplementation → Response mới mỗi lần (body chỉ đọc được 1 lần).
    const fetcher = vi.fn().mockImplementation(async () =>
      jsonResponse(400, {
        statusCode: 400,
        error: 'name must be shorter, type invalid',
        timestamp: '',
        path: '/api/popups',
      }),
    );
    const client = createApiClient(fetcher);
    await expect(client.post('/api/popups', {})).rejects.toMatchObject({
      status: 400,
      messages: ['name must be shorter', 'type invalid'],
    });
    await expect(client.post('/api/popups', {})).rejects.toBeInstanceOf(ApiError);
  });
});
