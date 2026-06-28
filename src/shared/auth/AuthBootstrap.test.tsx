import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { AuthBootstrap } from './AuthBootstrap';

function renderBootstrap() {
  return render(
    <AppProvider i18n={enTranslations}>
      <AuthBootstrap>
        <div>protected-content</div>
      </AuthBootstrap>
    </AppProvider>,
  );
}

describe('AuthBootstrap', () => {
  it('blocks children while loading, then renders them after token-exchange succeeds', async () => {
    renderBootstrap();
    // loading: child chưa render
    expect(screen.getByText('Đang kết nối tới Shopify…')).toBeInTheDocument();
    expect(screen.queryByText('protected-content')).not.toBeInTheDocument();
    // ready
    expect(await screen.findByText('protected-content')).toBeInTheDocument();
  });

  it('calls token-exchange exactly once', async () => {
    let count = 0;
    server.use(
      http.post('*/api/auth/token-exchange', () => {
        count += 1;
        return HttpResponse.json({ shop: 'test.myshopify.com', installed: true });
      }),
    );
    renderBootstrap();
    await screen.findByText('protected-content');
    expect(count).toBe(1);
  });

  it('shows an error Banner (no infinite retry) when token-exchange fails', async () => {
    server.use(
      http.post('*/api/auth/token-exchange', () =>
        HttpResponse.json(
          { statusCode: 401, error: 'invalid session token', timestamp: '', path: '/api/auth/token-exchange' },
          { status: 401 },
        ),
      ),
    );
    renderBootstrap();
    expect(await screen.findByText(/Xác thực thất bại/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid session token/i)).toBeInTheDocument();
    expect(screen.queryByText('protected-content')).not.toBeInTheDocument();
  });
});
