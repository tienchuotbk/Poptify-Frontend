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
import { useToast } from '../../../shared/ui/ToastProvider';
import { useResourcePicker } from '../../../shared/app-bridge/resource-picker';
import {
  validateNoAngleBracket,
  validateRequired,
  type FieldError,
} from '../../../shared/validation/widget-validators';
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
    }
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
    </Page>
  );
}
