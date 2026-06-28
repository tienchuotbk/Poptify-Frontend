import { type PageTarget } from './enums';
import { type BaseWidget } from './common';

// api-contract §7 — Product Sliders. (best_sellers KHÔNG hỗ trợ → 400)
export const SLIDER_SOURCE_TYPES = ['featured', 'collection'] as const;
export type SliderSourceType = (typeof SLIDER_SOURCE_TYPES)[number];

export const SLIDER_PLACEMENT_POSITIONS = [
  'above_product_description',
  'below_product_description',
  'custom_selector',
] as const;
export type SliderPlacementPosition = (typeof SLIDER_PLACEMENT_POSITIONS)[number];

export interface SliderSourceConfig {
  productHandles?: string[]; // featured; handle (a-z0-9-_), tối đa 50
  collectionHandle?: string; // collection
}
export interface SliderLayoutConfig {
  desktopItems?: number; // 1-12
  tabletItems?: number;
  mobileItems?: number;
  rows?: number; // 1-12
  spacing?: string;
}
export interface SliderBehaviorConfig {
  autoplay?: boolean;
  autoplaySpeed?: number; // 0-60000 ms
  infiniteLoop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
}
export interface SliderDisplayConfig {
  showImage?: boolean;
  showTitle?: boolean;
  showPrice?: boolean;
  showComparePrice?: boolean;
  showAddToCart?: boolean;
  showSaleBadge?: boolean;
}
export interface SliderPlacementConfig {
  targetPages?: PageTarget[];
  placementPosition?: SliderPlacementPosition;
  customSelector?: string; // CSS selector, max 128, cấm `<`
}

export interface CreateProductSlider {
  name: string; // required, max 255
  sourceType: SliderSourceType; // required
  enabled?: boolean;
  priority?: number;
  sourceConfig?: SliderSourceConfig;
  layoutConfig?: SliderLayoutConfig;
  behaviorConfig?: SliderBehaviorConfig;
  displayConfig?: SliderDisplayConfig;
  placementConfig?: SliderPlacementConfig;
}

export type UpdateProductSlider = Partial<CreateProductSlider>;

export interface ProductSlider extends BaseWidget, CreateProductSlider {
  enabled: boolean;
}
