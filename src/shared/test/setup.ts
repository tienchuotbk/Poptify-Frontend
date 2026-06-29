import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './server';

// App Bridge v4 mock: useAppBridge trả object STABLE (idToken + resourcePicker).
// resourcePicker uỷ quyền cho globalThis.__RESOURCE_PICKER__ để test tuỳ chỉnh selection.
vi.mock('@shopify/app-bridge-react', () => {
  const shopify = {
    idToken: async () => 'test-session-token',
    resourcePicker: async (opts: { type: string; multiple?: boolean }) => {
      const fn = (globalThis as Record<string, unknown>).__RESOURCE_PICKER__ as
        | ((o: { type: string; multiple?: boolean }) => Promise<unknown>)
        | undefined;
      return fn ? fn(opts) : undefined;
    },
  };
  // NavMenu render vào admin chrome (ngoài iframe) → no-op trong test (jsdom không có admin).
  return { useAppBridge: () => shopify, NavMenu: () => null };
});

// jsdom thiếu API Polaris cần — polyfill.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// MSW lifecycle.
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  delete (globalThis as Record<string, unknown>).__RESOURCE_PICKER__;
});
afterAll(() => server.close());
