import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

// Assert Page title heading (h1) — ổn định qua các phase (không phụ thuộc nội dung placeholder).
// Sau auth bootstrap (token-exchange MSW 200) page mới render → findByRole (async).
describe('App shell routing', () => {
  it('renders the dashboard at /', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
  });

  it.each([
    ['/settings', 'App Settings'],
    ['/popups', 'Popups'],
    ['/announcement-bars', 'Announcement Bars'],
    ['/product-sliders', 'Product Sliders'],
  ])('renders %s route', async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { name: heading, level: 1 })).toBeInTheDocument();
  });
});
