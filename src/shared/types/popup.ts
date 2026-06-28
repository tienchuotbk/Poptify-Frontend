import { type PageTarget } from './enums';
import { type BaseWidget } from './common';

// api-contract §5 — Popups.
export const POPUP_TYPES = ['discount', 'newsletter', 'exit_intent'] as const;
export type PopupType = (typeof POPUP_TYPES)[number];

export const POPUP_TRIGGER_TYPES = [
  'page_load',
  'time_delay',
  'scroll_percentage',
  'exit_intent',
] as const;
export type PopupTriggerType = (typeof POPUP_TRIGGER_TYPES)[number];

export const POPUP_FREQUENCIES = [
  'every_visit',
  'once_per_session',
  'once_per_day',
  'once_per_week',
] as const;
export type PopupFrequency = (typeof POPUP_FREQUENCIES)[number];

export const POPUP_POSITIONS = ['center', 'bottom_left', 'bottom_right'] as const;
export type PopupPosition = (typeof POPUP_POSITIONS)[number];

export interface PopupTriggerConfig {
  type: PopupTriggerType;
  value?: string; // max 16, vd "5"/"30"
}
export interface PopupFrequencyConfig {
  frequency: PopupFrequency;
}
export interface PopupDesignConfig {
  width?: string;
  position?: PopupPosition;
  backgroundColor?: string; // hex
  textColor?: string; // hex
  borderRadius?: string;
  imageUrl?: string; // https, max 2048
  showCloseButton?: boolean;
}
export interface PopupContentConfig {
  title?: string;
  description?: string;
  couponCode?: string;
  buttonText?: string;
  buttonLink?: string; // https
  emailInputEnabled?: boolean;
  submitButtonText?: string;
  successMessage?: string;
}

export interface CreatePopup {
  name: string; // required, max 255
  type: PopupType; // required
  enabled?: boolean;
  priority?: number;
  triggerConfig?: PopupTriggerConfig;
  frequencyConfig?: PopupFrequencyConfig;
  targetPages?: PageTarget[];
  designConfig?: PopupDesignConfig;
  contentConfig?: PopupContentConfig;
}

export type UpdatePopup = Partial<CreatePopup>;

export interface Popup extends BaseWidget, CreatePopup {
  enabled: boolean;
}
