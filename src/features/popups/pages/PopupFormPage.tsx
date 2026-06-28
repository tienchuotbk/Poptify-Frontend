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
  TextField,
} from '@shopify/polaris';
import {
  PAGE_TARGETS,
  POPUP_FREQUENCIES,
  POPUP_POSITIONS,
  POPUP_TRIGGER_TYPES,
  POPUP_TYPES,
  type CreatePopup,
  type PageTarget,
  type PopupFrequency,
  type PopupPosition,
  type PopupTriggerType,
  type PopupType,
} from '../../../shared/types';
import { ApiErrorBanner } from '../../../shared/ui/ApiErrorBanner';
import { useToast } from '../../../shared/ui/ToastProvider';
import {
  validateHexOptional,
  validateHttpsOptional,
  validateRequired,
  type FieldError,
} from '../../../shared/validation/widget-validators';
import { popupHooks } from '../hooks/use-popups';

const toOptions = (values: readonly string[]) => values.map((v) => ({ label: v, value: v }));

function cleanConfig<T extends Record<string, unknown>>(obj: T): T | undefined {
  const hasValue = Object.values(obj).some((v) => v !== undefined && v !== '');
  return hasValue ? obj : undefined;
}

export function PopupFormPage({ popupId }: { popupId?: number } = {}) {
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useToast();
  const id = popupId ?? (params.id ? Number(params.id) : undefined);
  const isEdit = id !== undefined;

  const detail = popupHooks.useDetail(id ?? -1, isEdit);
  const create = popupHooks.useCreate();
  const update = popupHooks.useUpdate();

  const [name, setName] = useState('');
  const [type, setType] = useState<PopupType>('discount');
  const [enabled, setEnabled] = useState(false);
  const [priority, setPriority] = useState('');
  const [triggerType, setTriggerType] = useState<PopupTriggerType>('page_load');
  const [triggerValue, setTriggerValue] = useState('');
  const [frequency, setFrequency] = useState<PopupFrequency>('every_visit');
  const [targetPages, setTargetPages] = useState<string[]>([]);
  const [position, setPosition] = useState<PopupPosition>('center');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [clientErrors, setClientErrors] = useState<FieldError[]>([]);

  useEffect(() => {
    const p = detail.data;
    if (p) {
      setName(p.name);
      setType(p.type);
      setEnabled(p.enabled);
      setPriority(p.priority?.toString() ?? '');
      setTriggerType(p.triggerConfig?.type ?? 'page_load');
      setTriggerValue(p.triggerConfig?.value ?? '');
      setFrequency(p.frequencyConfig?.frequency ?? 'every_visit');
      setTargetPages(p.targetPages ?? []);
      setPosition(p.designConfig?.position ?? 'center');
      setBackgroundColor(p.designConfig?.backgroundColor ?? '');
      setTextColor(p.designConfig?.textColor ?? '');
      setImageUrl(p.designConfig?.imageUrl ?? '');
      setShowCloseButton(p.designConfig?.showCloseButton ?? true);
      setTitle(p.contentConfig?.title ?? '');
      setDescription(p.contentConfig?.description ?? '');
      setCouponCode(p.contentConfig?.couponCode ?? '');
      setButtonText(p.contentConfig?.buttonText ?? '');
      setButtonLink(p.contentConfig?.buttonLink ?? '');
      setSuccessMessage(p.contentConfig?.successMessage ?? '');
    }
  }, [detail.data]);

  if (isEdit && detail.isLoading) {
    return (
      <SkeletonPage title="Sửa popup">
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
    const imgErr = validateHttpsOptional('Ảnh (imageUrl)', imageUrl);
    if (imgErr) errors.push(imgErr);
    const linkErr = validateHttpsOptional('Liên kết nút (buttonLink)', buttonLink);
    if (linkErr) errors.push(linkErr);
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

    const body: CreatePopup = {
      name,
      type,
      enabled,
      priority: priority ? Number(priority) : undefined,
      triggerConfig: { type: triggerType, value: triggerValue || undefined },
      frequencyConfig: { frequency },
      targetPages: targetPages.length ? (targetPages as PageTarget[]) : undefined,
      designConfig: cleanConfig({
        position,
        backgroundColor: backgroundColor || undefined,
        textColor: textColor || undefined,
        imageUrl: imageUrl || undefined,
        showCloseButton,
      }),
      contentConfig: cleanConfig({
        title: title || undefined,
        description: description || undefined,
        couponCode: couponCode || undefined,
        buttonText: buttonText || undefined,
        buttonLink: buttonLink || undefined,
        successMessage: successMessage || undefined,
      }),
    };

    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật popup' : 'Đã tạo popup');
      navigate('/popups');
    };
    const onError = () => showToast('Lưu thất bại', { error: true });

    if (isEdit && id !== undefined) {
      update.mutate({ id, body }, { onSuccess, onError });
    } else {
      create.mutate(body, { onSuccess, onError });
    }
  };

  const serverError = create.error ?? update.error;
  const isSaving = create.isPending || update.isPending;

  return (
    <Page
      title={isEdit ? 'Sửa popup' : 'Tạo popup'}
      backAction={{ content: 'Popups', onAction: () => navigate('/popups') }}
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
          <ApiErrorBanner error={serverError} title="Lưu thất bại" />
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
              options={toOptions(POPUP_TYPES)}
              value={type}
              onChange={(v) => setType(v as PopupType)}
            />
            <Checkbox label="Bật popup" checked={enabled} onChange={setEnabled} />
            <TextField
              label="Độ ưu tiên"
              type="number"
              value={priority}
              onChange={setPriority}
              autoComplete="off"
            />
          </FormLayout>
        </Card>

        <Card>
          <FormLayout>
            <FormLayout.Group>
              <Select
                label="Kích hoạt"
                options={toOptions(POPUP_TRIGGER_TYPES)}
                value={triggerType}
                onChange={(v) => setTriggerType(v as PopupTriggerType)}
              />
              <TextField
                label="Giá trị kích hoạt"
                value={triggerValue}
                onChange={setTriggerValue}
                autoComplete="off"
                helpText='vd "5" (giây) hoặc "30" (%)'
              />
            </FormLayout.Group>
            <Select
              label="Tần suất"
              options={toOptions(POPUP_FREQUENCIES)}
              value={frequency}
              onChange={(v) => setFrequency(v as PopupFrequency)}
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

        <Card>
          <FormLayout>
            <Select
              label="Vị trí"
              options={toOptions(POPUP_POSITIONS)}
              value={position}
              onChange={(v) => setPosition(v as PopupPosition)}
            />
            <FormLayout.Group>
              <TextField
                label="Màu nền (hex)"
                value={backgroundColor}
                onChange={setBackgroundColor}
                autoComplete="off"
                placeholder="#ffffff"
                error={clientErrors.find((e) => e.field === 'Màu nền')?.message}
              />
              <TextField
                label="Màu chữ (hex)"
                value={textColor}
                onChange={setTextColor}
                autoComplete="off"
                placeholder="#000000"
                error={clientErrors.find((e) => e.field === 'Màu chữ')?.message}
              />
            </FormLayout.Group>
            <TextField
              label="Ảnh (URL https)"
              value={imageUrl}
              onChange={setImageUrl}
              autoComplete="off"
              error={clientErrors.find((e) => e.field === 'Ảnh (imageUrl)')?.message}
            />
            <Checkbox
              label="Hiện nút đóng"
              checked={showCloseButton}
              onChange={setShowCloseButton}
            />
          </FormLayout>
        </Card>

        <Card>
          <FormLayout>
            <TextField label="Tiêu đề" value={title} onChange={setTitle} autoComplete="off" />
            <TextField
              label="Mô tả"
              value={description}
              onChange={setDescription}
              autoComplete="off"
              multiline={3}
            />
            <TextField
              label="Mã giảm giá"
              value={couponCode}
              onChange={setCouponCode}
              autoComplete="off"
            />
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
                error={clientErrors.find((e) => e.field === 'Liên kết nút (buttonLink)')?.message}
              />
            </FormLayout.Group>
            <TextField
              label="Thông báo thành công"
              value={successMessage}
              onChange={setSuccessMessage}
              autoComplete="off"
            />
          </FormLayout>
        </Card>

        <InlineStack gap="200">
          <Button variant="primary" onClick={onSubmit} loading={isSaving}>
            {isEdit ? 'Cập nhật' : 'Tạo'}
          </Button>
          <Button onClick={() => navigate('/popups')}>Hủy</Button>
        </InlineStack>
      </BlockStack>
    </Page>
  );
}
