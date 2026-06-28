import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAuthenticatedFetch } from './authenticated-fetch';

function makeResponse(status: number): Response {
  return new Response(status === 204 ? null : JSON.stringify({ ok: true }), { status });
}

describe('createAuthenticatedFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('attaches a fresh Bearer token on each request and does not persist it', async () => {
    const getToken = vi.fn().mockResolvedValue('fresh-token');
    const reExchange = vi.fn();
    fetchMock.mockResolvedValue(makeResponse(200));

    const authedFetch = createAuthenticatedFetch({
      getToken,
      baseUrl: 'https://be.example.com',
      reExchange,
    });
    await authedFetch('/api/popups');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://be.example.com/api/popups');
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer fresh-token');
    // không persist token
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    // không bật credentials
    expect(init.credentials).toBeUndefined();
  });

  it('calls getToken fresh for every request', async () => {
    const getToken = vi.fn().mockResolvedValue('t');
    fetchMock.mockResolvedValue(makeResponse(200));
    const authedFetch = createAuthenticatedFetch({
      getToken,
      baseUrl: '',
      reExchange: vi.fn(),
    });
    await authedFetch('/a');
    await authedFetch('/b');
    expect(getToken).toHaveBeenCalledTimes(2);
  });

  it('on 401: re-exchanges once and retries once', async () => {
    const getToken = vi.fn().mockResolvedValue('t');
    const reExchange = vi.fn().mockResolvedValue(undefined);
    fetchMock.mockResolvedValueOnce(makeResponse(401)).mockResolvedValueOnce(makeResponse(200));

    const authedFetch = createAuthenticatedFetch({ getToken, baseUrl: '', reExchange });
    const res = await authedFetch('/api/popups');

    expect(reExchange).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
  });

  it('on repeated 401: does NOT loop (re-exchange once, then returns 401)', async () => {
    const getToken = vi.fn().mockResolvedValue('t');
    const reExchange = vi.fn().mockResolvedValue(undefined);
    fetchMock.mockResolvedValue(makeResponse(401));

    const authedFetch = createAuthenticatedFetch({ getToken, baseUrl: '', reExchange });
    const res = await authedFetch('/api/popups');

    expect(reExchange).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2); // initial + 1 retry only
    expect(res.status).toBe(401);
  });
});
