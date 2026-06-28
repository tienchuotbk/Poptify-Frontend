import { createWidgetHooks } from '../../../shared/api/widget-crud';
import { queryKeys } from '../../../shared/api/query-keys';
import {
  type AnnouncementBar,
  type CreateAnnouncementBar,
  type UpdateAnnouncementBar,
} from '../../../shared/types';

export const barHooks = createWidgetHooks<
  AnnouncementBar,
  CreateAnnouncementBar,
  UpdateAnnouncementBar
>('/api/announcement-bars', queryKeys.announcementBars);
