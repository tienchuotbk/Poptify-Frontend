import { type DeviceTarget, type PageTarget } from './enums';

// api-contract §4 — App Settings (1 record/shop).
export interface AppSettingsSchedule {
  startDate?: string; // ISO-8601 có offset/Z
  endDate?: string;
  timezone?: string; // IANA, max 64
}

export interface UpdateAppSettings {
  appEnabled?: boolean;
  deviceTarget?: DeviceTarget;
  globalPageTarget?: PageTarget;
  schedule?: AppSettingsSchedule;
}

export interface AppSettings {
  id: number;
  shop: string;
  appEnabled: boolean;
  deviceTarget: DeviceTarget;
  globalPageTarget: PageTarget;
  startDate: string | null;
  endDate: string | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}
