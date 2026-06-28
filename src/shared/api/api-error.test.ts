import { describe, it, expect } from 'vitest';
import { toApiError, ApiError } from './api-error';

describe('toApiError', () => {
  it('splits joined validation string into messages list', () => {
    const body = {
      statusCode: 400,
      error: 'name must be shorter, type must be a valid enum',
      timestamp: '2026-06-28T00:00:00.000Z',
      path: '/api/popups',
    };
    const err = toApiError(400, body);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.messages).toEqual(['name must be shorter', 'type must be a valid enum']);
  });

  it('keeps single message when no comma', () => {
    const err = toApiError(404, { statusCode: 404, error: 'Not found', timestamp: '', path: '' });
    expect(err.messages).toEqual(['Not found']);
  });

  it('falls back when body is not an error shape', () => {
    const err = toApiError(500, null);
    expect(err.status).toBe(500);
    expect(err.messages[0]).toMatch(/500/);
  });
});
