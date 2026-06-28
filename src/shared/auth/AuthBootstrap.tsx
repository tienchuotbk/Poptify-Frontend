import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Banner, BlockStack, Card, Page, Spinner, Text } from '@shopify/polaris';
import { env } from '../config/env';
import { createApiClient } from '../api/api-client';
import { createAuthenticatedFetch } from '../api/authenticated-fetch';
import { ApiClientContext } from '../api/api-context';
import { runTokenExchange } from './token-exchange';
import { useSessionToken } from './use-session-token';

type BootstrapState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

/**
 * Auth bootstrap gate (api-contract §1): gọi token-exchange MỘT lần lúc load,
 * chặn render children (→ query con không chạy trước khi xong). Fail → Banner + nút thử lại.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const getToken = useSessionToken();
  const reExchange = useMemo(
    () => () => runTokenExchange(getToken, env.VITE_API_BASE_URL),
    [getToken],
  );
  const apiClient = useMemo(
    () =>
      createApiClient(
        createAuthenticatedFetch({ getToken, baseUrl: env.VITE_API_BASE_URL, reExchange }),
      ),
    [getToken, reExchange],
  );

  const [state, setState] = useState<BootstrapState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const ranForAttemptRef = useRef<number | null>(null);

  useEffect(() => {
    // single-flight: 1 lần / attempt (guard StrictMode double-invoke). Retry khi attempt++.
    if (ranForAttemptRef.current === attempt) return;
    ranForAttemptRef.current = attempt;
    setState({ status: 'loading' });
    reExchange().then(
      () => setState({ status: 'ready' }),
      (e: unknown) => setState({ status: 'error', message: (e as Error).message }),
    );
  }, [reExchange, attempt]);

  if (state.status === 'loading') {
    return (
      <Page>
        <Card>
          <BlockStack inlineAlign="center" gap="300">
            <Spinner accessibilityLabel="Đang kết nối tới Shopify" />
            <Text as="p" tone="subdued">
              Đang kết nối tới Shopify…
            </Text>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  if (state.status === 'error') {
    return (
      <Page title="Không kết nối được">
        <Banner
          tone="critical"
          title="Xác thực thất bại"
          action={{ content: 'Thử lại', onAction: () => setAttempt((a) => a + 1) }}
        >
          {state.message}
        </Banner>
      </Page>
    );
  }

  return <ApiClientContext.Provider value={apiClient}>{children}</ApiClientContext.Provider>;
}
