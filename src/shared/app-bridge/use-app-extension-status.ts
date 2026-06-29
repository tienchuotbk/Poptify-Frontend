import { useAppBridge } from '@shopify/app-bridge-react';
import { useEffect, useState } from 'react';
import { getAppExtensionStatus, type AppExtensionStatus } from './app-extension-status';

export type AppExtensionStatusState =
  { loading: true } | { loading: false; status: AppExtensionStatus };

const UNSUPPORTED: AppExtensionStatus = { supported: false, blocks: [] };

/** Hook đọc trạng thái theme app extension (1 lần lúc mount). Lỗi → không hỗ trợ. */
export function useAppExtensionStatus(): AppExtensionStatusState {
  const shopify = useAppBridge();
  const [state, setState] = useState<AppExtensionStatusState>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    getAppExtensionStatus(shopify)
      .then((status) => {
        if (!cancelled) setState({ loading: false, status });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, status: UNSUPPORTED });
      });
    return () => {
      cancelled = true;
    };
  }, [shopify]);

  return state;
}
