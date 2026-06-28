import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '@shopify/polaris/build/esm/styles.css';
import './shared/config/env'; // fail-fast env validation lúc boot
import { routes } from './routes';

async function start() {
  // Dev preview: stub App Bridge + MSW (chỉ dev + VITE_DEV_MOCK=true; bị loại khỏi prod bundle).
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_MOCK === 'true') {
    const { startDevMock } = await import('./mocks/start-dev-mock');
    await startDevMock();
  }

  const router = createBrowserRouter(routes);
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element #root not found');
  }

  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

void start();
