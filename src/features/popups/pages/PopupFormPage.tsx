import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  FormLayout,
  InlineGrid,
  InlineStack,
  Page,
  Select,
  SkeletonBodyText,
  SkeletonPage,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  PAGE_TARGETS,
  PAGE_TARGET_LABELS,
  POPUP_FREQUENCIES,
  POPUP_FREQUENCY_LABELS,
  POPUP_POSITIONS,
  POPUP_POSITION_LABELS,
  POPUP_TRIGGER_TYPES,
  POPUP_TRIGGER_TYPE_LABELS,
  POPUP_TYPES,
  POPUP_TYPE_LABELS,
  toOptions,
  type CreatePopup,
  type PageTarget,
  type PopupFrequency,
  type PopupPosition,
  type PopupTriggerType,
  type PopupType,
} from '../../../shared/types';
import { ApiErrorBanner } from '../../../shared/ui/ApiErrorBanner';
import { ColorField } from '../../../shared/ui/ColorField';
import { FormPreviewLayout } from '../../../shared/ui/FormPreviewLayout';
import { FormSaveBar } from '../../../shared/ui/FormSaveBar';
import { useUnsavedChanges } from '../../../shared/ui/use-unsaved-changes';
import { useToast } from '../../../shared/ui/ToastProvider';
import {
  validateHexOptional,
  validateHttpsOptional,
  validateRequired,
  type FieldError,
} from '../../../shared/validation/widget-validators';
import { PopupPreview } from '../components/PopupPreview';
import { POPUP_TEMPLATES, type PopupTemplate } from '../popup-templates';
import { popupHooks } from '../hooks/use-popups';

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

  const values = {
    name,
    type,
    enabled,
    priority,
    triggerType,
    triggerValue,
    frequency,
    targetPages,
    position,
    backgroundColor,
    textColor,
    imageUrl,
    showCloseButton,
    title,
    description,
    couponCode,
    buttonText,
    buttonLink,
    successMessage,
  };
  type PopupFormValues = typeof values;
  const { dirty, baseline, requestRebaseline, reset } = useUnsavedChanges(values);

  const applyValues = (v: PopupFormValues) => {
    setName(v.name);
    setType(v.type);
    setEnabled(v.enabled);
    setPriority(v.priority);
    setTriggerType(v.triggerType);
    setTriggerValue(v.triggerValue);
    setFrequency(v.frequency);
    setTargetPages(v.targetPages);
    setPosition(v.position);
    setBackgroundColor(v.backgroundColor);
    setTextColor(v.textColor);
    setImageUrl(v.imageUrl);
    setShowCloseButton(v.showCloseButton);
    setTitle(v.title);
    setDescription(v.description);
    setCouponCode(v.couponCode);
    setButtonText(v.buttonText);
    setButtonLink(v.buttonLink);
    setSuccessMessage(v.successMessage);
  };

  const onDiscard = () => {
    applyValues(baseline.current);
    setClientErrors([]);
  };

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
      requestRebaseline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const applyTemplate = (t: PopupTemplate) => {
    const a = t.apply;
    setType(a.type);
    if (a.triggerType) setTriggerType(a.triggerType);
    if (a.triggerValue !== undefined) setTriggerValue(a.triggerValue);
    if (a.frequency) setFrequency(a.frequency);
    if (a.position) setPosition(a.position);
    if (a.backgroundColor !== undefined) setBackgroundColor(a.backgroundColor);
    if (a.textColor !== undefined) setTextColor(a.textColor);
    if (a.title !== undefined) setTitle(a.title);
    if (a.description !== undefined) setDescription(a.description);
    if (a.couponCode !== undefined) setCouponCode(a.couponCode);
    if (a.buttonText !== undefined) setButtonText(a.buttonText);
    if (a.successMessage !== undefined) setSuccessMessage(a.successMessage);
    if (!name.trim()) setName(t.label);
    showToast(`Đã áp dụng mẫu "${t.label}"`);
  };

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
      reset(); // dirty về false trước khi điều hướng → save bar không cảnh báo nhầm
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
      <FormSaveBar
        id="popup-save-bar"
        open={dirty}
        saving={isSaving}
        onSave={onSubmit}
        onDiscard={onDiscard}
      />
      <FormPreviewLayout
        preview={
          <PopupPreview
            title={title}
            description={description}
            couponCode={couponCode}
            buttonText={buttonText}
            backgroundColor={backgroundColor}
            textColor={textColor}
            imageUrl={imageUrl}
            showCloseButton={showCloseButton}
            position={position}
          />
        }
        form={
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Bắt đầu nhanh với mẫu có sẵn
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                  {POPUP_TEMPLATES.map((t) => (
                    <Box
                      key={t.id}
                      padding="300"
                      background="bg-surface-secondary"
                      borderWidth="025"
                      borderColor="border"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="h3" fontWeight="semibold">
                          {t.label}
                        </Text>
                        <Text as="p" tone="subdued" variant="bodySm">
                          {t.description}
                        </Text>
                        <Button onClick={() => applyTemplate(t)}>Dùng mẫu này</Button>
                      </BlockStack>
                    </Box>
                  ))}
                </InlineGrid>
              </BlockStack>
            </Card>

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
                  options={toOptions(POPUP_TYPES, POPUP_TYPE_LABELS)}
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
                    options={toOptions(POPUP_TRIGGER_TYPES, POPUP_TRIGGER_TYPE_LABELS)}
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
                  options={toOptions(POPUP_FREQUENCIES, POPUP_FREQUENCY_LABELS)}
                  value={frequency}
                  onChange={(v) => setFrequency(v as PopupFrequency)}
                />
                <ChoiceList
                  allowMultiple
                  title="Trang hiển thị"
                  choices={toOptions(PAGE_TARGETS, PAGE_TARGET_LABELS)}
                  selected={targetPages}
                  onChange={setTargetPages}
                />
              </FormLayout>
            </Card>

            <Card>
              <FormLayout>
                <Select
                  label="Vị trí"
                  options={toOptions(POPUP_POSITIONS, POPUP_POSITION_LABELS)}
                  value={position}
                  onChange={(v) => setPosition(v as PopupPosition)}
                />
                <FormLayout.Group>
                  <ColorField
                    label="Màu nền"
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                    placeholder="#ffffff"
                    error={clientErrors.find((e) => e.field === 'Màu nền')?.message}
                  />
                  <ColorField
                    label="Màu chữ"
                    value={textColor}
                    onChange={setTextColor}
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
                    error={
                      clientErrors.find((e) => e.field === 'Liên kết nút (buttonLink)')?.message
                    }
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
        }
      />
    </Page>
  );
}
