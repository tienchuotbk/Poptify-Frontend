import { type ApiClient } from '../../../shared/api/api-client';
import { type AppSettings, type UpdateAppSettings } from '../../../shared/types';

const PATH = '/api/app-settings';

export function getAppSettings(client: ApiClient): Promise<AppSettings> {
  return client.get<AppSettings>(PATH);
}

export function updateAppSettings(
  client: ApiClient,
  body: UpdateAppSettings,
): Promise<AppSettings> {
  return client.put<AppSettings>(PATH, body);
}
