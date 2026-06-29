import type { SliderPlacementPosition, SliderSourceType } from '../../shared/types';

// Mẫu slider dựng sẵn — cấu hình bố cục/hành vi/hiển thị/vị trí. KHÔNG set sản phẩm
// (merchant tự chọn nguồn). `apply` map thẳng vào state của ProductSliderFormPage.
export interface SliderTemplate {
  id: string;
  label: string;
  description: string;
  apply: {
    sourceType?: SliderSourceType;
    desktopItems?: string;
    autoplay?: boolean;
    showArrows?: boolean;
    showImage?: boolean;
    showPrice?: boolean;
    placementPosition?: SliderPlacementPosition;
  };
}

export const SLIDER_TEMPLATES: SliderTemplate[] = [
  {
    id: 'featured-4',
    label: '🛍️ Sản phẩm nổi bật',
    description: '4 sản phẩm/hàng, có mũi tên, đặt dưới mô tả.',
    apply: {
      sourceType: 'featured',
      desktopItems: '4',
      autoplay: false,
      showArrows: true,
      showImage: true,
      showPrice: true,
      placementPosition: 'below_product_description',
    },
  },
  {
    id: 'autoplay-carousel',
    label: '🎠 Carousel tự chạy',
    description: 'Tự động chạy, 4 sản phẩm/hàng, có mũi tên.',
    apply: {
      sourceType: 'collection',
      desktopItems: '4',
      autoplay: true,
      showArrows: true,
      showImage: true,
      showPrice: true,
      placementPosition: 'below_product_description',
    },
  },
  {
    id: 'compact-3',
    label: '🔲 Lưới gọn 3 cột',
    description: '3 sản phẩm/hàng, không mũi tên, gọn gàng.',
    apply: {
      sourceType: 'featured',
      desktopItems: '3',
      autoplay: false,
      showArrows: false,
      showImage: true,
      showPrice: true,
      placementPosition: 'above_product_description',
    },
  },
];
