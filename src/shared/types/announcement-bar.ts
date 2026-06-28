import { type DeviceTarget, type PageTarget } from './enums';
import { type BaseWidget } from './common';

// api-contract §6 — Announcement Bars.
export const BAR_TYPES = ['simple', 'countdown', 'free_shipping_progress'] as const;
export type AnnouncementBarType = (typeof BAR_TYPES)[number];

export const BAR_POSITIONS = ['top', 'bottom'] as const;
export type AnnouncementBarPosition = (typeof BAR_POSITIONS)[number];

export interface AnnouncementBarContentConfig {
  text?: string; // simple, max 500
  buttonText?: string;
  buttonLink?: string; // https
  endDate?: string; // countdown, ISO-8601
  expiredMessage?: string;
  goalAmount?: number; // free_shipping_progress, >=0
  progressText?: string;
  successText?: string;
}
export interface AnnouncementBarStyleConfig {
  backgroundColor?: string; // hex
  textColor?: string; // hex
  fontSize?: string;
  height?: string;
}
export interface AnnouncementBarVisibilityRules {
  deviceTarget?: DeviceTarget;
  targetPages?: PageTarget[];
}

export interface CreateAnnouncementBar {
  name: string; // required, max 255
  type: AnnouncementBarType; // required
  enabled?: boolean;
  priority?: number;
  position?: AnnouncementBarPosition; // default top
  sticky?: boolean;
  contentConfig?: AnnouncementBarContentConfig;
  styleConfig?: AnnouncementBarStyleConfig;
  visibilityRules?: AnnouncementBarVisibilityRules;
}

export type UpdateAnnouncementBar = Partial<CreateAnnouncementBar>;

export interface AnnouncementBar extends BaseWidget, CreateAnnouncementBar {
  enabled: boolean;
}
