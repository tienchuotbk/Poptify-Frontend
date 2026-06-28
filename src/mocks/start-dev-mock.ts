// Dev preview: stub App Bridge global + start MSW browser worker.
// Chỉ chạy khi import.meta.env.DEV && VITE_DEV_MOCK=true → KHÔNG vào production bundle.
export async function startDevMock(): Promise<void> {
  // useAppBridge() chỉ đọc window.shopify → stub để chạy ngoài Admin iframe.
  (window as unknown as { shopify: unknown }).shopify = {
    idToken: async () => 'dev-session-token',
    toast: { show: (message: string) => console.info('[dev toast]', message) },
    resourcePicker: async ({ type }: { type: 'product' | 'collection' }) =>
      type === 'product'
        ? [
            { id: 'gid://shopify/Product/1', handle: 'ao-thun-basic' },
            { id: 'gid://shopify/Product/2', handle: 'quan-jean' },
          ]
        : [{ id: 'gid://shopify/Collection/1', handle: 'bo-suu-tap-he' }],
  };

  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
  console.info('[dev] MSW + App Bridge mock đã bật (VITE_DEV_MOCK).');
}
