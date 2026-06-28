import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { makeProductSlider } from '../../../shared/test/fixtures';
import { ProductSlidersPage } from './ProductSlidersPage';

describe('ProductSlidersPage (list)', () => {
  it('renders rows from GET', async () => {
    server.use(
      http.get('*/api/product-sliders', () =>
        HttpResponse.json([
          makeProductSlider({ id: 1, name: 'Bestsellers row', sourceType: 'featured' }),
          makeProductSlider({ id: 2, name: 'Summer collection', sourceType: 'collection' }),
        ]),
      ),
    );
    renderWithProviders(<ProductSlidersPage />);
    expect(await screen.findByText('Bestsellers row')).toBeInTheDocument();
    expect(screen.getByText('Summer collection')).toBeInTheDocument();
  });

  it('shows EmptyState when empty', async () => {
    server.use(http.get('*/api/product-sliders', () => HttpResponse.json([])));
    renderWithProviders(<ProductSlidersPage />);
    expect(await screen.findByText('Chưa có slider nào')).toBeInTheDocument();
  });

  it('toggles enabled optimistically', async () => {
    const user = userEvent.setup();
    let current = [makeProductSlider({ id: 1, name: 'Slider A', enabled: false })];
    server.use(
      http.get('*/api/product-sliders', () => HttpResponse.json(current)),
      http.patch('*/api/product-sliders/1', async ({ request }) => {
        const body = (await request.json()) as { enabled?: boolean };
        current = current.map((s) => (s.id === 1 ? { ...s, enabled: body.enabled ?? s.enabled } : s));
        return HttpResponse.json(current[0]);
      }),
    );
    renderWithProviders(<ProductSlidersPage />);
    const checkbox = await screen.findByRole('checkbox', { name: /Bật Slider A/i });
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it('shows error Banner on failure', async () => {
    server.use(http.get('*/api/product-sliders', () => new HttpResponse(null, { status: 500 })));
    renderWithProviders(<ProductSlidersPage />);
    expect(await screen.findByText('Không tải được danh sách slider')).toBeInTheDocument();
  });
});
