import type { AppSettings } from '../types/app-settings';
import type { Popup } from '../types/popup';
import type { AnnouncementBar } from '../types/announcement-bar';
import type { ProductSlider } from '../types/product-slider';

const TS = '2026-01-01T00:00:00.000Z';

export const defaultAppSettings: AppSettings = {
  id: 1,
  shop: 'test.myshopify.com',
  appEnabled: false,
  deviceTarget: 'all',
  globalPageTarget: 'all',
  startDate: null,
  endDate: null,
  timezone: null,
  createdAt: TS,
  updatedAt: TS,
};

export function makePopup(overrides: Partial<Popup> = {}): Popup {
  return {
    id: 1,
    publicId: 'pub-popup-1',
    shop: 'test.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Welcome popup',
    type: 'discount',
    enabled: false,
    ...overrides,
  };
}

export function makeAnnouncementBar(overrides: Partial<AnnouncementBar> = {}): AnnouncementBar {
  return {
    id: 1,
    publicId: 'pub-bar-1',
    shop: 'test.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Free shipping bar',
    type: 'simple',
    enabled: false,
    position: 'top',
    ...overrides,
  };
}

export function makeProductSlider(overrides: Partial<ProductSlider> = {}): ProductSlider {
  return {
    id: 1,
    publicId: 'pub-slider-1',
    shop: 'test.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Featured products',
    sourceType: 'featured',
    enabled: false,
    ...overrides,
  };
}
