import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { makeAnnouncementBar } from '../../../shared/test/fixtures';
import { AnnouncementBarFormPage } from './AnnouncementBarFormPage';

describe('AnnouncementBarFormPage', () => {
  it('creates a bar (POST 201) and shows toast', async () => {
    const user = userEvent.setup();
    let posted = 0;
    server.use(
      http.post('*/api/announcement-bars', () => {
        posted += 1;
        return HttpResponse.json(makeAnnouncementBar({ id: 7 }), { status: 201 });
      }),
    );
    renderWithProviders(<AnnouncementBarFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'My bar');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(await screen.findByText('Đã tạo thanh thông báo')).toBeInTheDocument();
    expect(posted).toBe(1);
  });

  it('changes content fields when type changes (simple → countdown)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementBarFormPage />);
    // simple default → có "Văn bản"
    expect(await screen.findByLabelText('Văn bản')).toBeInTheDocument();
    // đổi sang countdown → hiện "Thông báo hết hạn", ẩn "Văn bản"
    await user.selectOptions(screen.getByLabelText('Loại'), 'countdown');
    expect(await screen.findByLabelText('Thông báo hết hạn')).toBeInTheDocument();
    expect(screen.queryByLabelText('Văn bản')).not.toBeInTheDocument();
  });

  it('blocks submit with client validation when name empty', async () => {
    const user = userEvent.setup();
    let posted = 0;
    server.use(
      http.post('*/api/announcement-bars', () => {
        posted += 1;
        return HttpResponse.json(makeAnnouncementBar(), { status: 201 });
      }),
    );
    renderWithProviders(<AnnouncementBarFormPage />);
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect((await screen.findAllByText(/không được để trống/i)).length).toBeGreaterThan(0);
    expect(posted).toBe(0);
  });

  it('shows API error Banner on 400', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/announcement-bars', () =>
        HttpResponse.json(
          { statusCode: 400, error: 'type must be a valid enum value', timestamp: '', path: '/api/announcement-bars' },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<AnnouncementBarFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'Valid');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(await screen.findByText(/type must be a valid enum value/i)).toBeInTheDocument();
  });
});
