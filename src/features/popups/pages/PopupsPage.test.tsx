import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { makePopup } from '../../../shared/test/fixtures';
import { PopupsPage } from './PopupsPage';

describe('PopupsPage (list)', () => {
  it('renders rows from GET', async () => {
    server.use(
      http.get('*/api/popups', () =>
        HttpResponse.json([
          makePopup({ id: 1, name: 'Welcome', type: 'discount' }),
          makePopup({ id: 2, name: 'Newsletter signup', type: 'newsletter' }),
        ]),
      ),
    );
    renderWithProviders(<PopupsPage />);
    expect(await screen.findByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Newsletter signup')).toBeInTheDocument();
  });

  it('shows EmptyState when list is empty', async () => {
    server.use(http.get('*/api/popups', () => HttpResponse.json([])));
    renderWithProviders(<PopupsPage />);
    expect(await screen.findByText('Chưa có popup nào')).toBeInTheDocument();
  });

  it('toggles enabled optimistically', async () => {
    const user = userEvent.setup();
    let current = [makePopup({ id: 1, name: 'Welcome', enabled: false })];
    server.use(
      http.get('*/api/popups', () => HttpResponse.json(current)),
      http.patch('*/api/popups/1', async ({ request }) => {
        const body = (await request.json()) as { enabled?: boolean };
        current = current.map((p) =>
          p.id === 1 ? { ...p, enabled: body.enabled ?? p.enabled } : p,
        );
        return HttpResponse.json(current[0]);
      }),
    );
    renderWithProviders(<PopupsPage />);
    const checkbox = await screen.findByRole('checkbox', { name: /Bật Welcome/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it('shows error Banner on failure', async () => {
    server.use(http.get('*/api/popups', () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<PopupsPage />);
    expect(await screen.findByText('Không tải được danh sách popup')).toBeInTheDocument();
  });
});
