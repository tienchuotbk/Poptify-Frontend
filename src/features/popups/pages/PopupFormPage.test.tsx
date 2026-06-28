import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { makePopup } from '../../../shared/test/fixtures';
import { PopupFormPage } from './PopupFormPage';

describe('PopupFormPage', () => {
  it('creates a popup (POST 201) and shows success toast', async () => {
    const user = userEvent.setup();
    let posted = 0;
    server.use(
      http.post('*/api/popups', async () => {
        posted += 1;
        return HttpResponse.json(makePopup({ id: 5, name: 'New' }), { status: 201 });
      }),
    );
    renderWithProviders(<PopupFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'New popup');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));

    expect(await screen.findByText('Đã tạo popup')).toBeInTheDocument();
    expect(posted).toBe(1);
  });

  it('blocks submit and shows client validation when name is empty', async () => {
    const user = userEvent.setup();
    let posted = 0;
    server.use(
      http.post('*/api/popups', () => {
        posted += 1;
        return HttpResponse.json(makePopup(), { status: 201 });
      }),
    );
    renderWithProviders(<PopupFormPage />);
    await user.click(screen.getByRole('button', { name: 'Tạo' }));

    expect((await screen.findAllByText(/không được để trống/i)).length).toBeGreaterThan(0);
    expect(posted).toBe(0);
  });

  it('blocks submit when buttonLink is not https', async () => {
    const user = userEvent.setup();
    let posted = 0;
    server.use(
      http.post('*/api/popups', () => {
        posted += 1;
        return HttpResponse.json(makePopup(), { status: 201 });
      }),
    );
    renderWithProviders(<PopupFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'X');
    await user.type(screen.getByLabelText('Liên kết nút (https)'), 'http://insecure.example.com');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));

    expect((await screen.findAllByText(/phải là URL https:\/\//i)).length).toBeGreaterThan(0);
    expect(posted).toBe(0);
  });

  it('shows API error Banner on 400 (string error → list)', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/popups', () =>
        HttpResponse.json(
          {
            statusCode: 400,
            error: 'name must be shorter than or equal to 255 characters',
            timestamp: '',
            path: '/api/popups',
          },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<PopupFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'Valid name');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));

    expect(
      await screen.findByText(/name must be shorter than or equal to 255 characters/i),
    ).toBeInTheDocument();
  });

  it('loads existing popup in edit mode', async () => {
    server.use(
      http.get('*/api/popups/1', () =>
        HttpResponse.json(makePopup({ id: 1, name: 'Existing popup' })),
      ),
    );
    renderWithProviders(<PopupFormPage popupId={1} />);
    await waitFor(() =>
      expect(screen.getByLabelText('Tên')).toHaveValue('Existing popup'),
    );
  });
});
