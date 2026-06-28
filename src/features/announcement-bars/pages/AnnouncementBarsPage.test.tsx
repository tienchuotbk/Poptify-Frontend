import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { makeAnnouncementBar } from '../../../shared/test/fixtures';
import { AnnouncementBarsPage } from './AnnouncementBarsPage';

describe('AnnouncementBarsPage (list)', () => {
  it('renders rows from GET', async () => {
    server.use(
      http.get('*/api/announcement-bars', () =>
        HttpResponse.json([
          makeAnnouncementBar({ id: 1, name: 'Free shipping', type: 'free_shipping_progress' }),
          makeAnnouncementBar({ id: 2, name: 'Flash sale', type: 'countdown' }),
        ]),
      ),
    );
    renderWithProviders(<AnnouncementBarsPage />);
    expect(await screen.findByText('Free shipping')).toBeInTheDocument();
    expect(screen.getByText('Flash sale')).toBeInTheDocument();
  });

  it('shows EmptyState when empty', async () => {
    server.use(http.get('*/api/announcement-bars', () => HttpResponse.json([])));
    renderWithProviders(<AnnouncementBarsPage />);
    expect(await screen.findByText('Chưa có thanh thông báo nào')).toBeInTheDocument();
  });

  it('toggles enabled optimistically', async () => {
    const user = userEvent.setup();
    let current = [makeAnnouncementBar({ id: 1, name: 'Bar A', enabled: false })];
    server.use(
      http.get('*/api/announcement-bars', () => HttpResponse.json(current)),
      http.patch('*/api/announcement-bars/1', async ({ request }) => {
        const body = (await request.json()) as { enabled?: boolean };
        current = current.map((b) => (b.id === 1 ? { ...b, enabled: body.enabled ?? b.enabled } : b));
        return HttpResponse.json(current[0]);
      }),
    );
    renderWithProviders(<AnnouncementBarsPage />);
    const checkbox = await screen.findByRole('checkbox', { name: /Bật Bar A/i });
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it('shows error Banner on failure', async () => {
    server.use(http.get('*/api/announcement-bars', () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<AnnouncementBarsPage />);
    expect(await screen.findByText('Không tải được danh sách thanh thông báo')).toBeInTheDocument();
  });
});
