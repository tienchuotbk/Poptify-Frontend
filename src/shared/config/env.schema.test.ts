import { describe, it, expect } from 'vitest';
import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('passes with valid env', () => {
    expect(
      parseEnv({
        VITE_SHOPIFY_API_KEY: 'k',
        VITE_API_BASE_URL: 'http://localhost:3000',
      }),
    ).toEqual({
      VITE_SHOPIFY_API_KEY: 'k',
      VITE_API_BASE_URL: 'http://localhost:3000',
    });
  });

  it('throws when api key missing', () => {
    expect(() => parseEnv({ VITE_API_BASE_URL: 'http://localhost:3000' })).toThrow(
      /VITE_SHOPIFY_API_KEY/,
    );
  });

  it('throws when base url invalid', () => {
    expect(() =>
      parseEnv({ VITE_SHOPIFY_API_KEY: 'k', VITE_API_BASE_URL: 'not-a-url' }),
    ).toThrow(/VITE_API_BASE_URL/);
  });
});
