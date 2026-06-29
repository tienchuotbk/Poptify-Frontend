import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  EmptyState,
  IndexTable,
  InlineStack,
  Page,
  SkeletonBodyText,
  SkeletonPage,
  Text,
} from '@shopify/polaris';
import { POPUP_TYPE_LABELS } from '../../../shared/types';
import { ExtensionStatusBanner } from '../../../shared/ui/ExtensionStatusBanner';
import { useToast } from '../../../shared/ui/ToastProvider';
import { popupHooks } from '../hooks/use-popups';

export function PopupsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading, isError, error, refetch } = popupHooks.useList();
  const toggle = popupHooks.useToggleEnabled();
  const remove = popupHooks.useDelete();

  if (isLoading) {
    return (
      <SkeletonPage title="Popups">
        <Card>
          <SkeletonBodyText lines={6} />
        </Card>
      </SkeletonPage>
    );
  }

  if (isError || !data) {
    return (
      <Page title="Popups">
        <Banner
          tone="critical"
          title="Không tải được danh sách popup"
          action={{ content: 'Thử lại', onAction: () => void refetch() }}
        >
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </Banner>
      </Page>
    );
  }

  const onDelete = (id: number) => {
    remove.mutate(id, {
      onSuccess: () => showToast('Đã xóa popup'),
      onError: () => showToast('Xóa thất bại', { error: true }),
    });
  };

  return (
    <Page
      title="Popups"
      primaryAction={{ content: 'Tạo popup', onAction: () => navigate('/popups/new') }}
    >
      <BlockStack gap="400">
        <ExtensionStatusBanner widget="popups" />
        <Card padding="0">
          {data.length === 0 ? (
            <EmptyState
              heading="Chưa có popup nào"
              action={{ content: 'Tạo popup', onAction: () => navigate('/popups/new') }}
              image=""
            >
              <p>Tạo popup đầu tiên để hiển thị ưu đãi cho khách hàng.</p>
            </EmptyState>
          ) : (
            <IndexTable
              resourceName={{ singular: 'popup', plural: 'popups' }}
              itemCount={data.length}
              selectable={false}
              headings={[
                { title: 'Tên' },
                { title: 'Loại' },
                { title: 'Bật' },
                { title: 'Thao tác' },
              ]}
            >
              {data.map((popup, index) => (
                <IndexTable.Row id={String(popup.id)} key={popup.id} position={index}>
                  <IndexTable.Cell>
                    <Text as="span" fontWeight="semibold">
                      {popup.name}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge>{POPUP_TYPE_LABELS[popup.type] ?? popup.type}</Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Checkbox
                      label={`Bật ${popup.name}`}
                      labelHidden
                      checked={popup.enabled}
                      onChange={(value) => toggle.mutate({ id: popup.id, enabled: value })}
                    />
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200">
                      <Button onClick={() => navigate(`/popups/${popup.id}/edit`)}>Sửa</Button>
                      <Button tone="critical" onClick={() => onDelete(popup.id)}>
                        Xóa
                      </Button>
                    </InlineStack>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
