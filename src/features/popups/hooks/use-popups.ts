import { createWidgetHooks } from '../../../shared/api/widget-crud';
import { queryKeys } from '../../../shared/api/query-keys';
import { type CreatePopup, type Popup, type UpdatePopup } from '../../../shared/types';

export const popupHooks = createWidgetHooks<Popup, CreatePopup, UpdatePopup>(
  '/api/popups',
  queryKeys.popups,
);
