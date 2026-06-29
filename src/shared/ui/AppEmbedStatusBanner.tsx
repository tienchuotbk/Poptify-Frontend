import { useAppBridge } from '@shopify/app-bridge-react';
import { Banner, BlockStack, Button, InlineStack, List, Text } from '@shopify/polaris';
import { buildAppEmbedDeepLink } from '../app-bridge/app-embed-status';
import { useAppEmbedStatus } from '../app-bridge/use-app-embed-status';

/**
 * Banner nhắc merchant rằng app embed của Poptify chưa được bật trên theme đang publish
 * → widget (Popup / Announcement Bar) sẽ KHÔNG hiển thị cho khách. Nút CTA deep-link
 * sang Theme Editor (target="_top" để thoát iframe Admin) với app embed bật sẵn.
 *
 * Ẩn (render null) khi: đang load, App Bridge không hỗ trợ (App Bridge cũ / dev-mock),
 * hoặc tất cả app embed đã active.
 */
export function AppEmbedStatusBanner() {
  const shopify = useAppBridge();
  const state = useAppEmbedStatus();

  if (state.loading || !state.status.supported || state.status.allActive) {
    return null;
  }

  const { embeds } = state.status;
  const inactive = embeds.filter((e) => e.status !== 'active');
  // embeds rỗng = không phát hiện app embed nào (thường do extension chưa deploy).
  const notDeployed = embeds.length === 0;
  const deepLink = buildAppEmbedDeepLink(shopify, inactive[0]?.handle ?? 'popups');

  return (
    <Banner
      tone="warning"
      title={
        notDeployed
          ? 'Chưa phát hiện app embed trên cửa hàng'
          : 'App embed chưa được bật — widget đang ẩn với khách'
      }
    >
      <BlockStack gap="300">
        <Text as="p">
          {notDeployed
            ? 'Poptify chưa có app embed nào hoạt động trên theme đang publish. Bật app embed trong Theme Editor để Popup và Announcement Bar hiển thị cho khách hàng.'
            : 'Popup và Announcement Bar chỉ hiển thị trên cửa hàng khi app embed được bật trong theme đang publish. Hiện tại tính năng đang TẮT, khách của bạn sẽ không nhìn thấy widget.'}
        </Text>

        {inactive.length > 0 && (
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Đang tắt:
            </Text>
            <List>
              {inactive.map((e) => (
                <List.Item key={e.handle}>{e.name}</List.Item>
              ))}
            </List>
          </BlockStack>
        )}

        {deepLink && (
          <InlineStack>
            <Button url={deepLink} target="_top" variant="primary">
              Bật app embed trong Theme Editor
            </Button>
          </InlineStack>
        )}
      </BlockStack>
    </Banner>
  );
}
