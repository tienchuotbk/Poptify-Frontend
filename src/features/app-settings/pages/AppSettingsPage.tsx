import { useEffect, useState } from 'react';
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  FormLayout,
  Page,
  Select,
  SkeletonBodyText,
  SkeletonPage,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  DEVICE_TARGETS,
  PAGE_TARGETS,
  type DeviceTarget,
  type PageTarget,
} from '../../../shared/types';
import { ApiErrorBanner } from '../../../shared/ui/ApiErrorBanner';
import { useToast } from '../../../shared/ui/ToastProvider';
import { useAppSettings, useUpdateAppSettings } from '../hooks/use-app-settings';

const toOptions = (values: readonly string[]) => values.map((v) => ({ label: v, value: v }));

export function AppSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useAppSettings();
  const update = useUpdateAppSettings();
  const { showToast } = useToast();

  const [deviceTarget, setDeviceTarget] = useState<DeviceTarget>('all');
  const [pageTarget, setPageTarget] = useState<PageTarget>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (data) {
      setDeviceTarget(data.deviceTarget);
      setPageTarget(data.globalPageTarget);
      setStartDate(data.startDate ?? '');
      setEndDate(data.endDate ?? '');
      setTimezone(data.timezone ?? '');
    }
  }, [data]);

  if (isLoading) {
    return (
      <SkeletonPage title="App Settings">
        <Card>
          <SkeletonBodyText lines={6} />
        </Card>
      </SkeletonPage>
    );
  }

  if (isError || !data) {
    return (
      <Page title="App Settings">
        <Banner
          tone="critical"
          title="Không tải được cấu hình"
          action={{ content: 'Thử lại', onAction: () => void refetch() }}
        >
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </Banner>
      </Page>
    );
  }

  const onToggleEnabled = (checked: boolean) => {
    update.mutate(
      { appEnabled: checked },
      {
        onSuccess: () => showToast(checked ? 'Đã bật ứng dụng' : 'Đã tắt ứng dụng'),
        onError: () => showToast('Lưu thất bại', { error: true }),
      },
    );
  };

  const onSave = () => {
    update.mutate(
      {
        deviceTarget,
        globalPageTarget: pageTarget,
        schedule: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          timezone: timezone || undefined,
        },
      },
      {
        onSuccess: () => showToast('Đã lưu cấu hình'),
        onError: () => showToast('Lưu thất bại', { error: true }),
      },
    );
  };

  return (
    <Page title="App Settings">
      <BlockStack gap="400">
        {update.isError && <ApiErrorBanner error={update.error} title="Lưu thất bại" />}

        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Trạng thái ứng dụng
            </Text>
            <Checkbox
              label="Bật ứng dụng (hiển thị widget trên storefront)"
              checked={data.appEnabled}
              onChange={onToggleEnabled}
              disabled={update.isPending}
            />
          </BlockStack>
        </Card>

        <Card>
          <FormLayout>
            <Select
              label="Thiết bị hiển thị"
              options={toOptions(DEVICE_TARGETS)}
              value={deviceTarget}
              onChange={(v) => setDeviceTarget(v as DeviceTarget)}
            />
            <Select
              label="Trang hiển thị mặc định"
              options={toOptions(PAGE_TARGETS)}
              value={pageTarget}
              onChange={(v) => setPageTarget(v as PageTarget)}
            />
            <TextField
              label="Bắt đầu (ISO-8601, có offset/Z)"
              value={startDate}
              onChange={setStartDate}
              autoComplete="off"
              placeholder="2026-07-01T00:00:00Z"
            />
            <TextField
              label="Kết thúc (ISO-8601)"
              value={endDate}
              onChange={setEndDate}
              autoComplete="off"
            />
            <TextField
              label="Múi giờ (IANA)"
              value={timezone}
              onChange={setTimezone}
              autoComplete="off"
              placeholder="Asia/Ho_Chi_Minh"
            />
            <Button variant="primary" onClick={onSave} loading={update.isPending}>
              Lưu cấu hình
            </Button>
          </FormLayout>
        </Card>
      </BlockStack>
    </Page>
  );
}
