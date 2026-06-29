// Map widget ↔ block/embed trong theme app extension. `handle` = tên file .liquid.

export type WidgetKey = 'popups' | 'bars' | 'sliders';

export interface WidgetExtension {
  handle: string;
  label: string;
  /** 'embed' = app embed (bật ở App embeds); 'block' = app block (thêm vào section). */
  kind: 'embed' | 'block';
}

export const WIDGET_EXTENSIONS: Record<WidgetKey, WidgetExtension> = {
  popups: { handle: 'popups', label: 'Popups', kind: 'embed' },
  bars: { handle: 'announcement-bars', label: 'Announcement Bars', kind: 'embed' },
  sliders: { handle: 'product-slider', label: 'Product Slider', kind: 'block' },
};

/** 2 app embed dùng cho onboarding ở Dashboard. */
export const EMBED_WIDGETS: WidgetKey[] = ['popups', 'bars'];
