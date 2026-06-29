import { useAppBridge } from '@shopify/app-bridge-react';
import {
  Badge,
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  SkeletonBodyText,
  Text,
} from '@shopify/polaris';
import {
  buildAppEmbedDeepLink,
  isBlockActive,
} from '../../../shared/app-bridge/app-extension-status';
import { useAppExtensionStatus } from '../../../shared/app-bridge/use-app-extension-status';
import { EMBED_WIDGETS, WIDGET_EXTENSIONS } from '../../../shared/app-bridge/widget-extensions';
import { useToast } from '../../../shared/ui/ToastProvider';
import { useAppSettings, useUpdateAppSettings } from '../../app-settings/hooks/use-app-settings';

/**
 * Onboarding ở Dashboard:
 *  1. Bật/tắt ứng dụng (appEnabled).
 *  2. Trạng thái 2 app embed (Popups, Announcement Bars) — luôn hiển thị, badge xanh
 *     khi đã bật, kèm nút "Bật" deep-link khi chưa.
 */
export function DashboardOnboarding() {
  const shopify = useAppBridge();
  const settings = useAppSettings();
  const update = useUpdateAppSettings();
  const { showToast } = useToast();
  const ext = useAppExtensionStatus();

  const appEnabled = settings.data?.appEnabled ?? false;

  const toggleApp = () => {
    update.mutate(
      { appEnabled: !appEnabled },
      {
        onSuccess: () => showToast(!appEnabled ? 'Đã bật ứng dụng' : 'Đã tắt ứng dụng'),
        onError: () => showToast('Lưu thất bại', { error: true }),
      },
    );
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Bắt đầu với Poptify
        </Text>

        {/* Bước 1 — kích hoạt app */}
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <BlockStack gap="100">
            <Text as="span" fontWeight="semibold">
              1. Kích hoạt ứng dụng
            </Text>
            <Text as="span" tone="subdued">
              Bật để hiển thị widget trên storefront.
            </Text>
          </BlockStack>
          <InlineStack gap="300" blockAlign="center">
            <Badge tone={appEnabled ? 'success' : undefined}>
              {appEnabled ? 'Đang bật' : 'Đang tắt'}
            </Badge>
            <Button loading={update.isPending || settings.isLoading} onClick={toggleApp}>
              {appEnabled ? 'Tắt' : 'Bật'}
            </Button>
          </InlineStack>
        </InlineStack>

        <Divider />

        {/* Bước 2 — app embed */}
        <BlockStack gap="200">
          <Text as="span" fontWeight="semibold">
            2. Bật app embed trên theme
          </Text>
          {ext.loading ? (
            <SkeletonBodyText lines={2} />
          ) : ext.status.supported ? (
            EMBED_WIDGETS.map((key) => {
              const { handle, label } = WIDGET_EXTENSIONS[key];
              const active = isBlockActive(ext.status, handle);
              const link = buildAppEmbedDeepLink(shopify, handle);
              return (
                <InlineStack key={key} align="space-between" blockAlign="center" wrap={false}>
                  <Text as="span">{label}</Text>
                  <InlineStack gap="300" blockAlign="center">
                    <Badge tone={active ? 'success' : 'attention'}>
                      {active ? 'Đã bật embed' : 'Chưa bật embed'}
                    </Badge>
                    {!active && link && (
                      <Button url={link} target="_top">
                        Bật
                      </Button>
                    )}
                  </InlineStack>
                </InlineStack>
              );
            })
          ) : (
            <Text as="p" tone="subdued">
              Không kiểm tra được trạng thái app embed trong môi trường này (mở app trong Shopify
              Admin để kiểm tra).
            </Text>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
