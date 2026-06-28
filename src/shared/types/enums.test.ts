import { describe, it, expect } from 'vitest';
import { DEVICE_TARGETS, PAGE_TARGETS } from './enums';
import { POPUP_TYPES, POPUP_TRIGGER_TYPES, POPUP_FREQUENCIES, POPUP_POSITIONS } from './popup';
import { BAR_TYPES, BAR_POSITIONS } from './announcement-bar';
import { SLIDER_SOURCE_TYPES, SLIDER_PLACEMENT_POSITIONS } from './product-slider';

// Lock enum FE khớp api-contract §3-7. Đổi BE → cập nhật cả contract + test này.
describe('enums khớp contract', () => {
  it('shared targets', () => {
    expect([...DEVICE_TARGETS]).toEqual(['all', 'desktop', 'mobile']);
    expect([...PAGE_TARGETS]).toEqual(['all', 'homepage', 'product', 'collection', 'cart']);
  });

  it('popup enums', () => {
    expect([...POPUP_TYPES]).toEqual(['discount', 'newsletter', 'exit_intent']);
    expect([...POPUP_TRIGGER_TYPES]).toEqual([
      'page_load',
      'time_delay',
      'scroll_percentage',
      'exit_intent',
    ]);
    expect([...POPUP_FREQUENCIES]).toEqual([
      'every_visit',
      'once_per_session',
      'once_per_day',
      'once_per_week',
    ]);
    expect([...POPUP_POSITIONS]).toEqual(['center', 'bottom_left', 'bottom_right']);
  });

  it('announcement bar enums', () => {
    expect([...BAR_TYPES]).toEqual(['simple', 'countdown', 'free_shipping_progress']);
    expect([...BAR_POSITIONS]).toEqual(['top', 'bottom']);
  });

  it('product slider enums (best_sellers excluded)', () => {
    expect([...SLIDER_SOURCE_TYPES]).toEqual(['featured', 'collection']);
    expect([...SLIDER_SOURCE_TYPES]).not.toContain('best_sellers');
    expect([...SLIDER_PLACEMENT_POSITIONS]).toEqual([
      'above_product_description',
      'below_product_description',
      'custom_selector',
    ]);
  });
});
