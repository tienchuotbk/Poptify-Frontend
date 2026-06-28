import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { AppProvider, Frame } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { MemoryRouter } from 'react-router-dom';
import { QueryProvider } from '../api/query-provider';
import { ApiClientContext } from '../api/api-context';
import { createApiClient } from '../api/api-client';
import { createAuthenticatedFetch } from '../api/authenticated-fetch';
import { ToastProvider } from '../ui/ToastProvider';

// ApiClient test: authedFetch hit MSW (global fetch). Token giả, baseUrl rỗng (handlers wildcard).
export function createTestApiClient() {
  return createApiClient(
    createAuthenticatedFetch({
      getToken: async () => 'test-session-token',
      baseUrl: '',
      reExchange: async () => {},
    }),
  );
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AppProvider i18n={enTranslations}>
      <MemoryRouter>
        <QueryProvider>
          <ApiClientContext.Provider value={createTestApiClient()}>
            <Frame>
              <ToastProvider>{children}</ToastProvider>
            </Frame>
          </ApiClientContext.Provider>
        </QueryProvider>
      </MemoryRouter>
    </AppProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
