import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  FormLayout,
  InlineStack,
  Page,
  Select,
  SkeletonBodyText,
  SkeletonPage,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  BAR_POSITIONS,
  BAR_TYPES,
  DEVICE_TARGETS,
  PAGE_TARGETS,
  type AnnouncementBarPosition,
  type AnnouncementBarType,
  type CreateAnnouncementBar,
  type DeviceTarget,
  type PageTarget,
} from '../../../shared/types';
import { ApiErrorBanner } from '../../../shared/ui/ApiErrorBanner';
import { useToast } from '../../../shared/ui/ToastProvider';
import {
  validateHexOptional,
  validateHttpsOptional,
  validateRequired,
  type FieldError,
} from '../../../shared/validation/widget-validators';
import { barHooks } from '../hooks/use-announcement-bars';

const toOptions = (values: readonly string[]) => values.map((v) => ({ label: v, value: v }));

function cleanConfig<T extends Record<string, unknown>>(obj: T): T | undefined {
  return Object.values(obj).some((v) => v !== undefined && v !== '') ? obj : undefined;
}

export function AnnouncementBarFormPage({ barId }: { barId?: number } = {}) {
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useToast();
  const id = barId ?? (params.id ? Number(params.id) : undefined);
  const isEdit = id !== undefined;

  const detail = barHooks.useDetail(id ?? -1, isEdit);
  const create = barHooks.useCreate();
  const update = barHooks.useUpdate();

  const [name, setName] = useState('');
  const [type, setType] = useState<AnnouncementBarType>('simple');
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState<AnnouncementBarPosition>('top');
  const [sticky, setSticky] = useState(false);
  // simple
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  // countdown
  const [endDate, setEndDate] = useState('');
  const [expiredMessage, setExpiredMessage] = useState('');
  // free_shipping_progress
  const [goalAmount, setGoalAmount] = useState('');
  const [progressText, setProgressText] = useState('');
  const [successText, setSuccessText] = useState('');
  // style
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  // visibility
  const [deviceTarget, setDeviceTarget] = useState<DeviceTarget>('all');
  const [targetPages, setTargetPages] = useState<string[]>([]);

  const [clientErrors, setClientErrors] = useState<FieldError[]>([]);

  useEffect(() => {
    const b = detail.data;
    if (b) {
      setName(b.name);
      setType(b.type);
      setEnabled(b.enabled);
      setPosition(b.position ?? 'top');
      setSticky(b.sticky ?? false);
      setText(b.contentConfig?.text ?? '');
      setButtonText(b.contentConfig?.buttonText ?? '');
      setButtonLink(b.contentConfig?.buttonLink ?? '');
      setEndDate(b.contentConfig?.endDate ?? '');
      setExpiredMessage(b.contentConfig?.expiredMessage ?? '');
      setGoalAmount(b.contentConfig?.goalAmount?.toString() ?? '');
      setProgressText(b.contentConfig?.progressText ?? '');
      setSuccessText(b.contentConfig?.successText ?? '');
      setBackgroundColor(b.styleConfig?.backgroundColor ?? '');
      setTextColor(b.styleConfig?.textColor ?? '');
      setDeviceTarget(b.visibilityRules?.deviceTarget ?? 'all');
      setTargetPages(b.visibilityRules?.targetPages ?? []);
    }
  }, [detail.data]);

  if (isEdit && detail.isLoading) {
    return (
      <SkeletonPage title="Sửa thanh thông báo">
        <Card>
          <SkeletonBodyText lines={8} />
        </Card>
      </SkeletonPage>
    );
  }

  const validate = (): FieldError[] => {
    const errors: FieldError[] = [];
    const nameErr = validateRequired('Tên', name);
    if (nameErr) errors.push(nameErr);
    if (type === 'simple') {
      const linkErr = validateHttpsOptional('Liên kết nút (buttonLink)', buttonLink);
      if (linkErr) errors.push(linkErr);
    }
    const bgErr = validateHexOptional('Màu nền', backgroundColor);
    if (bgErr) errors.push(bgErr);
    const textErr = validateHexOptional('Màu chữ', textColor);
    if (textErr) errors.push(textErr);
    return errors;
  };

  const onSubmit = () => {
    const errors = validate();
    setClientErrors(errors);
    if (errors.length > 0) return;

    const contentConfig =
      type === 'simple'
        ? cleanConfig({
            text: text || undefined,
            buttonText: buttonText || undefined,
            buttonLink: buttonLink || undefined,
          })
        : type === 'countdown'
          ? cleanConfig({
              endDate: endDate || undefined,
              expiredMessage: expiredMessage || undefined,
            })
          : cleanConfig({
              goalAmount: goalAmount ? Number(goalAmount) : undefined,
              progressText: progressText || undefined,
              successText: successText || undefined,
            });

    const body: CreateAnnouncementBar = {
      name,
      type,
      enabled,
      position,
      sticky,
      contentConfig,
      styleConfig: cleanConfig({
        backgroundColor: backgroundColor || undefined,
        textColor: textColor || undefined,
      }),
      visibilityRules: cleanConfig({
        deviceTarget,
        targetPages: targetPages.length ? (targetPages as PageTarget[]) : undefined,
      }),
    };

    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật thanh thông báo' : 'Đã tạo thanh thông báo');
      navigate('/announcement-bars');
    };
    const onError = () => showToast('Lưu thất bại', { error: true });

    if (isEdit && id !== undefined) {
      update.mutate({ id, body }, { onSuccess, onError });
    } else {
      create.mutate(body, { onSuccess, onError });
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <Page
      title={isEdit ? 'Sửa thanh thông báo' : 'Tạo thanh thông báo'}
      backAction={{ content: 'Announcement Bars', onAction: () => navigate('/announcement-bars') }}
    >
      <BlockStack gap="400">
        {clientErrors.length > 0 && (
          <Banner tone="warning" title="Vui lòng kiểm tra lại các trường">
            <ul>
              {clientErrors.map((e) => (
                <li key={e.field}>{e.message}</li>
              ))}
            </ul>
          </Banner>
        )}
        {(create.isError || update.isError) && (
          <ApiErrorBanner error={create.error ?? update.error} title="Lưu thất bại" />
        )}

        <Card>
          <FormLayout>
            <TextField
              label="Tên"
              value={name}
              onChange={setName}
              autoComplete="off"
              requiredIndicator
              error={clientErrors.find((e) => e.field === 'Tên')?.message}
            />
            <Select
              label="Loại"
              options={toOptions(BAR_TYPES)}
              value={type}
              onChange={(v) => setType(v as AnnouncementBarType)}
            />
            <FormLayout.Group>
              <Select
                label="Vị trí"
                options={toOptions(BAR_POSITIONS)}
                value={position}
                onChange={(v) => setPosition(v as AnnouncementBarPosition)}
              />
              <Checkbox label="Ghim (sticky)" checked={sticky} onChange={setSticky} />
            </FormLayout.Group>
            <Checkbox label="Bật thanh thông báo" checked={enabled} onChange={setEnabled} />
          </FormLayout>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Nội dung ({type})
            </Text>
            <FormLayout>
              {type === 'simple' && (
                <>
                  <TextField label="Văn bản" value={text} onChange={setText} autoComplete="off" />
                  <FormLayout.Group>
                    <TextField
                      label="Chữ trên nút"
                      value={buttonText}
                      onChange={setButtonText}
                      autoComplete="off"
                    />
                    <TextField
                      label="Liên kết nút (https)"
                      value={buttonLink}
                      onChange={setButtonLink}
                      autoComplete="off"
                      error={
                        clientErrors.find((e) => e.field === 'Liên kết nút (buttonLink)')?.message
                      }
                    />
                  </FormLayout.Group>
                </>
              )}
              {type === 'countdown' && (
                <>
                  <TextField
                    label="Kết thúc (ISO-8601)"
                    value={endDate}
                    onChange={setEndDate}
                    autoComplete="off"
                  />
                  <TextField
                    label="Thông báo hết hạn"
                    value={expiredMessage}
                    onChange={setExpiredMessage}
                    autoComplete="off"
                  />
                </>
              )}
              {type === 'free_shipping_progress' && (
                <>
                  <TextField
                    label="Ngưỡng (goalAmount)"
                    type="number"
                    value={goalAmount}
                    onChange={setGoalAmount}
                    autoComplete="off"
                  />
                  <TextField
                    label="Văn bản tiến trình"
                    value={progressText}
                    onChange={setProgressText}
                    autoComplete="off"
                  />
                  <TextField
                    label="Văn bản thành công"
                    value={successText}
                    onChange={setSuccessText}
                    autoComplete="off"
                  />
                </>
              )}
            </FormLayout>
          </BlockStack>
        </Card>

        <Card>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Màu nền (hex)"
                value={backgroundColor}
                onChange={setBackgroundColor}
                autoComplete="off"
                placeholder="#000000"
                error={clientErrors.find((e) => e.field === 'Màu nền')?.message}
              />
              <TextField
                label="Màu chữ (hex)"
                value={textColor}
                onChange={setTextColor}
                autoComplete="off"
                placeholder="#ffffff"
                error={clientErrors.find((e) => e.field === 'Màu chữ')?.message}
              />
            </FormLayout.Group>
            <Select
              label="Thiết bị hiển thị"
              options={toOptions(DEVICE_TARGETS)}
              value={deviceTarget}
              onChange={(v) => setDeviceTarget(v as DeviceTarget)}
            />
            <ChoiceList
              allowMultiple
              title="Trang hiển thị"
              choices={PAGE_TARGETS.map((v) => ({ label: v, value: v }))}
              selected={targetPages}
              onChange={setTargetPages}
            />
          </FormLayout>
        </Card>

        <InlineStack gap="200">
          <Button variant="primary" onClick={onSubmit} loading={isSaving}>
            {isEdit ? 'Cập nhật' : 'Tạo'}
          </Button>
          <Button onClick={() => navigate('/announcement-bars')}>Hủy</Button>
        </InlineStack>
      </BlockStack>
    </Page>
  );
}
