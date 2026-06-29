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
import {
  BAR_POSITION_LABELS,
  BAR_TYPE_LABELS,
  type AnnouncementBarPosition,
} from '../../../shared/types';
import { ExtensionStatusBanner } from '../../../shared/ui/ExtensionStatusBanner';
import { useToast } from '../../../shared/ui/ToastProvider';
import { barHooks } from '../hooks/use-announcement-bars';

export function AnnouncementBarsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading, isError, error, refetch } = barHooks.useList();
  const toggle = barHooks.useToggleEnabled();
  const remove = barHooks.useDelete();

  if (isLoading) {
    return (
      <SkeletonPage title="Announcement Bars">
        <Card>
          <SkeletonBodyText lines={6} />
        </Card>
      </SkeletonPage>
    );
  }

  if (isError || !data) {
    return (
      <Page title="Announcement Bars">
        <Banner
          tone="critical"
          title="Không tải được danh sách thanh thông báo"
          action={{ content: 'Thử lại', onAction: () => void refetch() }}
        >
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </Banner>
      </Page>
    );
  }

  const onDelete = (id: number) => {
    remove.mutate(id, {
      onSuccess: () => showToast('Đã xóa thanh thông báo'),
      onError: () => showToast('Xóa thất bại', { error: true }),
    });
  };

  return (
    <Page
      title="Announcement Bars"
      primaryAction={{
        content: 'Tạo thanh thông báo',
        onAction: () => navigate('/announcement-bars/new'),
      }}
    >
      <BlockStack gap="400">
        <ExtensionStatusBanner widget="bars" />
        <Card padding="0">
          {data.length === 0 ? (
            <EmptyState
              heading="Chưa có thanh thông báo nào"
              action={{
                content: 'Tạo thanh thông báo',
                onAction: () => navigate('/announcement-bars/new'),
              }}
              image=""
            >
              <p>Tạo thanh thông báo đầu tiên (free shipping, countdown, …).</p>
            </EmptyState>
          ) : (
            <IndexTable
              resourceName={{ singular: 'thanh thông báo', plural: 'thanh thông báo' }}
              itemCount={data.length}
              selectable={false}
              headings={[
                { title: 'Tên' },
                { title: 'Loại' },
                { title: 'Vị trí' },
                { title: 'Bật' },
                { title: 'Thao tác' },
              ]}
            >
              {data.map((bar, index) => (
                <IndexTable.Row id={String(bar.id)} key={bar.id} position={index}>
                  <IndexTable.Cell>
                    <Text as="span" fontWeight="semibold">
                      {bar.name}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge>{BAR_TYPE_LABELS[bar.type] ?? bar.type}</Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {BAR_POSITION_LABELS[(bar.position ?? 'top') as AnnouncementBarPosition] ??
                      bar.position}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Checkbox
                      label={`Bật ${bar.name}`}
                      labelHidden
                      checked={bar.enabled}
                      onChange={(value) => toggle.mutate({ id: bar.id, enabled: value })}
                    />
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200">
                      <Button onClick={() => navigate(`/announcement-bars/${bar.id}/edit`)}>
                        Sửa
                      </Button>
                      <Button tone="critical" onClick={() => onDelete(bar.id)}>
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
