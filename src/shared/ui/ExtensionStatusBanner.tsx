import { useAppBridge } from '@shopify/app-bridge-react';
import { Banner, BlockStack, Button, Text } from '@shopify/polaris';
import { useCallback, useState } from 'react';
import {
  buildAppBlockDeepLink,
  buildAppEmbedDeepLink,
  findBlock,
  isBlockActive,
} from '../app-bridge/app-extension-status';
import { useAppExtensionStatus } from '../app-bridge/use-app-extension-status';
import { WIDGET_EXTENSIONS, type WidgetKey } from '../app-bridge/widget-extensions';

const dismissKey = (handle: string) => `poptify:ext-dismiss:${handle}`;

// localStorage có thể bị chặn trong iframe Admin (partitioned storage) / thiếu trong
// test → bọc an toàn, không để vỡ render.
function isDismissed(handle: string): boolean {
  try {
    return globalThis.localStorage?.getItem(dismissKey(handle)) === '1';
  } catch {
    return false;
  }
}
function persistDismiss(handle: string): void {
  try {
    globalThis.localStorage?.setItem(dismissKey(handle), '1');
  } catch {
    // bỏ qua — vẫn dismiss trong session qua state
  }
}

/**
 * Banner cảnh báo (dismissable) cho từng page widget khi extension tương ứng chưa
 * active trên theme publish. Ẩn khi: đang load / App Bridge không hỗ trợ / đã active /
 * user đã dismiss (lưu localStorage theo handle).
 */
export function ExtensionStatusBanner({ widget }: { widget: WidgetKey }) {
  const shopify = useAppBridge();
  const state = useAppExtensionStatus();
  const { handle, label, kind } = WIDGET_EXTENSIONS[widget];

  const [dismissed, setDismissed] = useState(() => isDismissed(handle));
  const onDismiss = useCallback(() => {
    persistDismiss(handle);
    setDismissed(true);
  }, [handle]);

  if (state.loading || !state.status.supported || dismissed) return null;
  if (isBlockActive(state.status, handle)) return null;

  const block = findBlock(state.status, handle);
  const deepLink =
    kind === 'embed'
      ? buildAppEmbedDeepLink(shopify, handle)
      : buildAppBlockDeepLink(shopify, handle);

  return (
    <Banner tone="warning" title={`${label} chưa hiển thị trên cửa hàng`} onDismiss={onDismiss}>
      <BlockStack gap="200">
        <Text as="p">
          {kind === 'embed'
            ? `App embed của ${label} chưa được bật trong theme đang publish — khách sẽ không thấy widget này.`
            : `Block ${label} chưa được thêm vào theme đang publish — khách sẽ không thấy slider.`}
          {block ? ` (trạng thái: ${block.status})` : ''}
        </Text>
        {deepLink && (
          <div>
            <Button url={deepLink} target="_top" variant="primary">
              {kind === 'embed' ? 'Bật app embed' : 'Thêm block vào theme'}
            </Button>
          </div>
        )}
      </BlockStack>
    </Banner>
  );
}
