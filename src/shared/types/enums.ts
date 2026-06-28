// Enums dùng chung — nguồn duy nhất, khớp ../backend/docs/api-contract.md §3.
// Dạng `as const` array để vừa sinh dropdown vừa test so khớp contract.

export const DEVICE_TARGETS = ['all', 'desktop', 'mobile'] as const;
export type DeviceTarget = (typeof DEVICE_TARGETS)[number];

export const PAGE_TARGETS = ['all', 'homepage', 'product', 'collection', 'cart'] as const;
export type PageTarget = (typeof PAGE_TARGETS)[number];
