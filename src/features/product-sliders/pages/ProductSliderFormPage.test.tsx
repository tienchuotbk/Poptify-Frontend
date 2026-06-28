import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../../../shared/test/test-utils';
import { server } from '../../../shared/test/server';
import { makeProductSlider } from '../../../shared/test/fixtures';
import { ProductSliderFormPage } from './ProductSliderFormPage';

type Captured = { sourceType?: string; sourceConfig?: Record<string, unknown> };

describe('ProductSliderFormPage', () => {
  it('featured: resource picker stores ONLY handles (not gid) and sends them on create', async () => {
    const user = userEvent.setup();
    (globalThis as Record<string, unknown>).__RESOURCE_PICKER__ = async (o: { type: string }) =>
      o.type === 'product'
        ? [
            { id: 'gid://shopify/Product/1', handle: 'prod-alpha' },
            { id: 'gid://shopify/Product/2', handle: 'prod-beta' },
          ]
        : [];

    let captured: Captured = {};
    server.use(
      http.post('*/api/product-sliders', async ({ request }) => {
        captured = (await request.json()) as Captured;
        return HttpResponse.json(makeProductSlider({ id: 9 }), { status: 201 });
      }),
    );

    renderWithProviders(<ProductSliderFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'Featured row');
    await user.click(screen.getByRole('button', { name: 'Chọn sản phẩm' }));

    expect(await screen.findByText('prod-alpha')).toBeInTheDocument();
    expect(screen.getByText('prod-beta')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    await waitFor(() => expect(captured.sourceConfig).toBeDefined());
    expect(captured.sourceConfig?.productHandles).toEqual(['prod-alpha', 'prod-beta']);
    // không lẫn gid
    expect(JSON.stringify(captured)).not.toContain('gid://');
  });

  it('collection: picks a single collection handle', async () => {
    const user = userEvent.setup();
    (globalThis as Record<string, unknown>).__RESOURCE_PICKER__ = async () => [
      { id: 'gid://shopify/Collection/10', handle: 'summer' },
    ];
    let captured: Captured = {};
    server.use(
      http.post('*/api/product-sliders', async ({ request }) => {
        captured = (await request.json()) as Captured;
        return HttpResponse.json(makeProductSlider({ id: 9, sourceType: 'collection' }), {
          status: 201,
        });
      }),
    );

    renderWithProviders(<ProductSliderFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'Collection row');
    await user.selectOptions(screen.getByLabelText('Nguồn sản phẩm'), 'collection');
    await user.click(screen.getByRole('button', { name: 'Chọn bộ sưu tập' }));
    expect(await screen.findByText(/Bộ sưu tập: summer/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    await waitFor(() => expect(captured.sourceConfig).toBeDefined());
    expect(captured.sourceConfig?.collectionHandle).toBe('summer');
  });

  it('blocks submit when custom_selector contains "<"', async () => {
    const user = userEvent.setup();
    let posted = 0;
    server.use(
      http.post('*/api/product-sliders', () => {
        posted += 1;
        return HttpResponse.json(makeProductSlider(), { status: 201 });
      }),
    );
    renderWithProviders(<ProductSliderFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'X');
    await user.selectOptions(screen.getByLabelText('Vị trí đặt'), 'custom_selector');
    await user.type(await screen.findByLabelText('CSS selector'), '<script>');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));

    expect((await screen.findAllByText(/không được chứa/i)).length).toBeGreaterThan(0);
    expect(posted).toBe(0);
  });

  it('shows API error Banner on 400', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/product-sliders', () =>
        HttpResponse.json(
          { statusCode: 400, error: 'sourceType must be a valid enum value', timestamp: '', path: '/api/product-sliders' },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<ProductSliderFormPage />);
    await user.type(screen.getByLabelText('Tên'), 'Valid');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(await screen.findByText(/sourceType must be a valid enum value/i)).toBeInTheDocument();
  });
});
