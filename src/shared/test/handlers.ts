import { http, HttpResponse } from 'msw';
import { defaultAppSettings } from './fixtures';

// Default MSW handlers (contract-fixture). Pattern `*/api/...` khớp mọi origin/port.
// Test feature override bằng server.use(...) cho case create/400/404/204.
export const handlers = [
  http.post('*/api/auth/token-exchange', () =>
    HttpResponse.json({ shop: 'test.myshopify.com', installed: true }),
  ),

  http.get('*/api/app-settings', () => HttpResponse.json(defaultAppSettings)),
  http.put('*/api/app-settings', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...defaultAppSettings, ...body, updatedAt: '2026-06-28T00:00:00.000Z' });
  }),

  http.get('*/api/popups', () => HttpResponse.json([])),
  http.get('*/api/announcement-bars', () => HttpResponse.json([])),
  http.get('*/api/product-sliders', () => HttpResponse.json([])),
];
