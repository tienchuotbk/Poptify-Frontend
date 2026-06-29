import { AppProvider, Frame } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Outlet } from 'react-router-dom';
import { QueryProvider } from './shared/api/query-provider';
import { AuthBootstrap } from './shared/auth/AuthBootstrap';
import { AppNavigation } from './shared/ui/AppNavigation';
import { ErrorBoundary } from './shared/ui/ErrorBoundary';
import { ToastProvider } from './shared/ui/ToastProvider';

/**
 * App shell: Polaris AppProvider (i18n en) + QueryProvider + Frame (cho Toast)
 * + AuthBootstrap (token-exchange gate) + Toast + ErrorBoundary.
 * Nav nằm ở sidebar Admin qua App Bridge <NavMenu> (AppNavigation) — không còn
 * trong Frame. Feature page render qua <Outlet/> sau khi auth sẵn sàng.
 */
export function AppLayout() {
  return (
    <AppProvider i18n={enTranslations}>
      <QueryProvider>
        <AppNavigation />
        <Frame>
          <AuthBootstrap>
            <ToastProvider>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </ToastProvider>
          </AuthBootstrap>
        </Frame>
      </QueryProvider>
    </AppProvider>
  );
}
