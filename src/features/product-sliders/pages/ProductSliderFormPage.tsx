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
  Tag,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  PAGE_TARGETS,
  PAGE_TARGET_LABELS,
  SLIDER_PLACEMENT_POSITIONS,
  SLIDER_PLACEMENT_POSITION_LABELS,
  SLIDER_SOURCE_TYPES,
  SLIDER_SOURCE_TYPE_LABELS,
  toOptions,
  type CreateProductSlider,
  type PageTarget,
  type SliderPlacementPosition,
  type SliderSourceType,
} from '../../../shared/types';
import { ApiErrorBanner } from '../../../shared/ui/ApiErrorBanner';
import { FormPreviewLayout } from '../../../shared/ui/FormPreviewLayout';
import { FormSaveBar } from '../../../shared/ui/FormSaveBar';
import { useUnsavedChanges } from '../../../shared/ui/use-unsaved-changes';
import { useToast } from '../../../shared/ui/ToastProvider';
import { useResourcePicker } from '../../../shared/app-bridge/resource-picker';
import {
  validateNoAngleBracket,
  validateRequired,
  type FieldError,
} from '../../../shared/validation/widget-validators';
import { SliderPreview } from '../components/SliderPreview';
import { SLIDER_TEMPLATES, type SliderTemplate } from '../slider-templates';
import { sliderHooks } from '../hooks/use-product-sliders';

function cleanConfig<T extends Record<string, unknown>>(obj: T): T | undefined {
  return Object.values(obj).some((v) => v !== undefined && v !== '') ? obj : undefined;
}

export function ProductSliderFormPage({ sliderId }: { sliderId?: number } = {}) {
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useToast();
  const { pickProducts, pickCollection } = useResourcePicker();
  const id = sliderId ?? (params.id ? Number(params.id) : undefined);
  const isEdit = id !== undefined;

  const detail = sliderHooks.useDetail(id ?? -1, isEdit);
  const create = sliderHooks.useCreate();
  const update = sliderHooks.useUpdate();

  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<SliderSourceType>('featured');
  const [enabled, setEnabled] = useState(false);
  const [productHandles, setProductHandles] = useState<string[]>([]);
  const [collectionHandle, setCollectionHandle] = useState('');
  const [desktopItems, setDesktopItems] = useState('');
  const [autoplay, setAutoplay] = useState(false);
  const [showArrows, setShowArrows] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [placementPosition, setPlacementPosition] = useState<SliderPlacementPosition>(
    'above_product_description',
  );
  const [customSelector, setCustomSelector] = useState('');
  const [targetPages, setTargetPages] = useState<string[]>([]);

  const [clientErrors, setClientErrors] = useState<FieldError[]>([]);

  const values = {
    name,
    sourceType,
    enabled,
    productHandles,
    collectionHandle,
    desktopItems,
    autoplay,
    showArrows,
    showImage,
    showPrice,
    placementPosition,
    customSelector,
    targetPages,
  };
  type SliderFormValues = typeof values;
  const { dirty, baseline, requestRebaseline, reset } = useUnsavedChanges(values);

  const applyValues = (v: SliderFormValues) => {
    setName(v.name);
    setSourceType(v.sourceType);
    setEnabled(v.enabled);
    setProductHandles(v.productHandles);
    setCollectionHandle(v.collectionHandle);
    setDesktopItems(v.desktopItems);
    setAutoplay(v.autoplay);
    setShowArrows(v.showArrows);
    setShowImage(v.showImage);
    setShowPrice(v.showPrice);
    setPlacementPosition(v.placementPosition);
    setCustomSelector(v.customSelector);
    setTargetPages(v.targetPages);
  };

  const onDiscard = () => {
    applyValues(baseline.current);
    setClientErrors([]);
  };

  useEffect(() => {
    const s = detail.data;
    if (s) {
      setName(s.name);
      setSourceType(s.sourceType);
      setEnabled(s.enabled);
      setProductHandles(s.sourceConfig?.productHandles ?? []);
      setCollectionHandle(s.sourceConfig?.collectionHandle ?? '');
      setDesktopItems(s.layoutConfig?.desktopItems?.toString() ?? '');
      setAutoplay(s.behaviorConfig?.autoplay ?? false);
      setShowArrows(s.behaviorConfig?.showArrows ?? true);
      setShowImage(s.displayConfig?.showImage ?? true);
      setShowPrice(s.displayConfig?.showPrice ?? true);
      setPlacementPosition(s.placementConfig?.placementPosition ?? 'above_product_description');
      setCustomSelector(s.placementConfig?.customSelector ?? '');
      setTargetPages(s.placementConfig?.targetPages ?? []);
      requestRebaseline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data]);

  if (isEdit && detail.isLoading) {
    return (
      <SkeletonPage title="Sửa slider">
        <Card>
          <SkeletonBodyText lines={8} />
        </Card>
      </SkeletonPage>
    );
  }

  const onPickProducts = async () => {
    const handles = await pickProducts();
    if (handles.length) setProductHandles(handles);
  };
  const onPickCollection = async () => {
    const handle = await pickCollection();
    if (handle) setCollectionHandle(handle);
  };

  const applyTemplate = (t: SliderTemplate) => {
    const a = t.apply;
    if (a.sourceType) setSourceType(a.sourceType);
    if (a.desktopItems !== undefined) setDesktopItems(a.desktopItems);
    if (a.autoplay !== undefined) setAutoplay(a.autoplay);
    if (a.showArrows !== undefined) setShowArrows(a.showArrows);
    if (a.showImage !== undefined) setShowImage(a.showImage);
    if (a.showPrice !== undefined) setShowPrice(a.showPrice);
    if (a.placementPosition) setPlacementPosition(a.placementPosition);
    if (!name.trim()) setName(t.label);
    showToast(`Đã áp dụng mẫu "${t.label}"`);
  };

  const validate = (): FieldError[] => {
    const errors: FieldError[] = [];
    const nameErr = validateRequired('Tên', name);
    if (nameErr) errors.push(nameErr);
    if (placementPosition === 'custom_selector') {
      const selErr = validateNoAngleBracket('CSS selector', customSelector);
      if (selErr) errors.push(selErr);
    }
    return errors;
  };

  const onSubmit = () => {
    const errors = validate();
    setClientErrors(errors);
    if (errors.length > 0) return;

    const sourceConfig =
      sourceType === 'featured'
        ? cleanConfig({ productHandles: productHandles.length ? productHandles : undefined })
        : cleanConfig({ collectionHandle: collectionHandle || undefined });

    const body: CreateProductSlider = {
      name,
      sourceType,
      enabled,
      sourceConfig,
      layoutConfig: cleanConfig({ desktopItems: desktopItems ? Number(desktopItems) : undefined }),
      behaviorConfig: cleanConfig({ autoplay, showArrows }),
      displayConfig: cleanConfig({ showImage, showPrice }),
      placementConfig: cleanConfig({
        placementPosition,
        customSelector:
          placementPosition === 'custom_selector' ? customSelector || undefined : undefined,
        targetPages: targetPages.length ? (targetPages as PageTarget[]) : undefined,
      }),
    };

    const onSuccess = () => {
      reset(); // dirty về false trước khi điều hướng → save bar không cảnh báo nhầm
      showToast(isEdit ? 'Đã cập nhật slider' : 'Đã tạo slider');
      navigate('/product-sliders');
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
      title={isEdit ? 'Sửa slider' : 'Tạo slider'}
      backAction={{ content: 'Product Sliders', onAction: () => navigate('/product-sliders') }}
    >
      <FormSaveBar
        id="slider-save-bar"
        open={dirty}
        saving={isSaving}
        onSave={onSubmit}
        onDiscard={onDiscard}
      />
      <FormPreviewLayout
        preview={
          <SliderPreview
            desktopItems={desktopItems}
            showArrows={showArrows}
            showImage={showImage}
            showPrice={showPrice}
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
                  {SLIDER_TEMPLATES.map((t) => (
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
                  label="Nguồn sản phẩm"
                  options={toOptions(SLIDER_SOURCE_TYPES, SLIDER_SOURCE_TYPE_LABELS)}
                  value={sourceType}
                  onChange={(v) => setSourceType(v as SliderSourceType)}
                />
                <Checkbox label="Bật slider" checked={enabled} onChange={setEnabled} />
              </FormLayout>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Chọn nguồn
                </Text>
                {sourceType === 'featured' ? (
                  <BlockStack gap="200">
                    <Button onClick={onPickProducts}>Chọn sản phẩm</Button>
                    {productHandles.length > 0 && (
                      <BlockStack gap="100">
                        <Text as="p" tone="subdued">
                          Đã chọn {productHandles.length} sản phẩm
                        </Text>
                        <InlineStack gap="100">
                          {productHandles.map((h) => (
                            <Tag key={h}>{h}</Tag>
                          ))}
                        </InlineStack>
                      </BlockStack>
                    )}
                  </BlockStack>
                ) : (
                  <BlockStack gap="200">
                    <Button onClick={onPickCollection}>Chọn bộ sưu tập</Button>
                    {collectionHandle && (
                      <Text as="p" tone="subdued">
                        Bộ sưu tập: {collectionHandle}
                      </Text>
                    )}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            <Card>
              <FormLayout>
                <TextField
                  label="Số item desktop"
                  type="number"
                  value={desktopItems}
                  onChange={setDesktopItems}
                  autoComplete="off"
                />
                <FormLayout.Group>
                  <Checkbox label="Tự động chạy" checked={autoplay} onChange={setAutoplay} />
                  <Checkbox label="Hiện mũi tên" checked={showArrows} onChange={setShowArrows} />
                </FormLayout.Group>
                <FormLayout.Group>
                  <Checkbox label="Hiện ảnh" checked={showImage} onChange={setShowImage} />
                  <Checkbox label="Hiện giá" checked={showPrice} onChange={setShowPrice} />
                </FormLayout.Group>
              </FormLayout>
            </Card>

            <Card>
              <FormLayout>
                <Select
                  label="Vị trí đặt"
                  options={toOptions(SLIDER_PLACEMENT_POSITIONS, SLIDER_PLACEMENT_POSITION_LABELS)}
                  value={placementPosition}
                  onChange={(v) => setPlacementPosition(v as SliderPlacementPosition)}
                />
                {placementPosition === 'custom_selector' && (
                  <TextField
                    label="CSS selector"
                    value={customSelector}
                    onChange={setCustomSelector}
                    autoComplete="off"
                    error={clientErrors.find((e) => e.field === 'CSS selector')?.message}
                  />
                )}
                <ChoiceList
                  allowMultiple
                  title="Trang hiển thị"
                  choices={toOptions(PAGE_TARGETS, PAGE_TARGET_LABELS)}
                  selected={targetPages}
                  onChange={setTargetPages}
                />
              </FormLayout>
            </Card>

            <InlineStack gap="200">
              <Button variant="primary" onClick={onSubmit} loading={isSaving}>
                {isEdit ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => navigate('/product-sliders')}>Hủy</Button>
            </InlineStack>
          </BlockStack>
        }
      />
    </Page>
  );
}
