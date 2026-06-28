import { useAppBridge } from '@shopify/app-bridge-react';
import { useCallback } from 'react';

interface AppBridgeWithIdToken {
  idToken: () => Promise<string>;
}

// Trả hàm lấy session token FRESH (App Bridge v4 idToken). Gọi mỗi request — không cache.
export function useSessionToken(): () => Promise<string> {
  const shopify = useAppBridge() as unknown as AppBridgeWithIdToken;
  return useCallback(() => shopify.idToken(), [shopify]);
}
