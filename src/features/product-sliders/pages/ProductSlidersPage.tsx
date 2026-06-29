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
import { ExtensionStatusBanner } from '../../../shared/ui/ExtensionStatusBanner';
import { useToast } from '../../../shared/ui/ToastProvider';
import { sliderHooks } from '../hooks/use-product-sliders';

export function ProductSlidersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading, isError, error, refetch } = sliderHooks.useList();
  const toggle = sliderHooks.useToggleEnabled();
  const remove = sliderHooks.useDelete();

  if (isLoading) {
    return (
      <SkeletonPage title="Product Sliders">
        <Card>
          <SkeletonBodyText lines={6} />
        </Card>
      </SkeletonPage>
    );
  }

  if (isError || !data) {
    return (
      <Page title="Product Sliders">
        <Banner
          tone="critical"
          title="Không tải được danh sách slider"
          action={{ content: 'Thử lại', onAction: () => void refetch() }}
        >
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </Banner>
      </Page>
    );
  }

  const onDelete = (id: number) => {
    remove.mutate(id, {
      onSuccess: () => showToast('Đã xóa slider'),
      onError: () => showToast('Xóa thất bại', { error: true }),
    });
  };

  return (
    <Page
      title="Product Sliders"
      primaryAction={{ content: 'Tạo slider', onAction: () => navigate('/product-sliders/new') }}
    >
      <BlockStack gap="400">
        <ExtensionStatusBanner widget="sliders" />
        <Card padding="0">
          {data.length === 0 ? (
            <EmptyState
              heading="Chưa có slider nào"
              action={{ content: 'Tạo slider', onAction: () => navigate('/product-sliders/new') }}
              image=""
            >
              <p>Tạo slider đầu tiên để hiển thị sản phẩm nổi bật.</p>
            </EmptyState>
          ) : (
            <IndexTable
              resourceName={{ singular: 'slider', plural: 'sliders' }}
              itemCount={data.length}
              selectable={false}
              headings={[
                { title: 'Tên' },
                { title: 'Nguồn' },
                { title: 'Bật' },
                { title: 'Thao tác' },
              ]}
            >
              {data.map((slider, index) => (
                <IndexTable.Row id={String(slider.id)} key={slider.id} position={index}>
                  <IndexTable.Cell>
                    <Text as="span" fontWeight="semibold">
                      {slider.name}
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge>{slider.sourceType}</Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Checkbox
                      label={`Bật ${slider.name}`}
                      labelHidden
                      checked={slider.enabled}
                      onChange={(value) => toggle.mutate({ id: slider.id, enabled: value })}
                    />
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <InlineStack gap="200">
                      <Button onClick={() => navigate(`/product-sliders/${slider.id}/edit`)}>
                        Sửa
                      </Button>
                      <Button tone="critical" onClick={() => onDelete(slider.id)}>
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
