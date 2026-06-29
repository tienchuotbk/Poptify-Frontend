import { useAppBridge } from '@shopify/app-bridge-react';
import { useEffect, useState } from 'react';
import { getAppEmbedStatus, type AppEmbedStatus } from './app-embed-status';

export type AppEmbedStatusState =
  | { loading: true }
  | { loading: false; status: AppEmbedStatus };

const UNSUPPORTED: AppEmbedStatus = { supported: false, embeds: [], allActive: false };

/** Hook đọc trạng thái app embed (1 lần lúc mount). Lỗi → coi như không hỗ trợ. */
export function useAppEmbedStatus(): AppEmbedStatusState {
  const shopify = useAppBridge();
  const [state, setState] = useState<AppEmbedStatusState>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    getAppEmbedStatus(shopify)
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
