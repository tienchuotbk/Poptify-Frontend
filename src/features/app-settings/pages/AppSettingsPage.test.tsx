import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { defaultAppSettings } from '../../../shared/test/fixtures';
import userEvent from '@testing-library/user-event';
import { AppSettingsPage } from './AppSettingsPage';

describe('AppSettingsPage', () => {
  it('renders settings loaded from GET (default: app disabled)', async () => {
    renderWithProviders(<AppSettingsPage />);
    const checkbox = await screen.findByRole('checkbox', { name: /Bật ứng dụng/i });
    expect(checkbox).not.toBeChecked();
  });

  it('toggles appEnabled optimistically and persists on success', async () => {
    const user = userEvent.setup();
    // Stateful MSW: GET phản chiếu state đã PUT (giống BE thật) → refetch sau invalidate giữ giá trị.
    let current = { ...defaultAppSettings };
    server.use(
      http.get('*/api/app-settings', () => HttpResponse.json(current)),
      http.put('*/api/app-settings', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        current = { ...current, ...body };
        return HttpResponse.json(current);
      }),
    );
    renderWithProviders(<AppSettingsPage />);
    const checkbox = await screen.findByRole('checkbox', { name: /Bật ứng dụng/i });
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it('shows an error Banner and rolls back optimistic toggle on 400', async () => {
    const user = userEvent.setup();
    server.use(
      http.put('*/api/app-settings', () =>
        HttpResponse.json(
          {
            statusCode: 400,
            error: 'deviceTarget must be a valid enum value',
            timestamp: '',
            path: '/api/app-settings',
          },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<AppSettingsPage />);
    const checkbox = await screen.findByRole('checkbox', { name: /Bật ứng dụng/i });
    await user.click(checkbox);

    // Banner lỗi hiển thị message từ chuỗi error
    expect(await screen.findByText(/deviceTarget must be a valid enum value/i)).toBeInTheDocument();
    // rollback: checkbox trở lại unchecked
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });
});
