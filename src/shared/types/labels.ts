// Nhãn người-đọc cho các giá trị enum (UI tiếng Việt). Theo từng enum vì có giá trị
// trùng tên khác nghĩa giữa các enum ('all', 'collection', 'exit_intent'...).

import type { AnnouncementBarPosition, AnnouncementBarType } from './announcement-bar';
import type { DeviceTarget, PageTarget } from './enums';
import type { PopupFrequency, PopupPosition, PopupTriggerType, PopupType } from './popup';
import type { SliderPlacementPosition, SliderSourceType } from './product-slider';

export const DEVICE_TARGET_LABELS: Record<DeviceTarget, string> = {
  all: 'Tất cả thiết bị',
  desktop: 'Máy tính (Desktop)',
  mobile: 'Điện thoại (Mobile)',
};

export const PAGE_TARGET_LABELS: Record<PageTarget, string> = {
  all: 'Tất cả trang',
  homepage: 'Trang chủ',
  product: 'Trang sản phẩm',
  collection: 'Trang bộ sưu tập',
  cart: 'Trang giỏ hàng',
};

export const BAR_TYPE_LABELS: Record<AnnouncementBarType, string> = {
  simple: 'Thông báo đơn giản',
  countdown: 'Đếm ngược',
  free_shipping_progress: 'Tiến trình miễn phí vận chuyển',
};

export const BAR_POSITION_LABELS: Record<AnnouncementBarPosition, string> = {
  top: 'Trên cùng',
  bottom: 'Dưới cùng',
};

export const POPUP_TYPE_LABELS: Record<PopupType, string> = {
  discount: 'Mã giảm giá',
  newsletter: 'Đăng ký nhận tin',
  exit_intent: 'Giữ chân khách rời trang',
};

export const POPUP_TRIGGER_TYPE_LABELS: Record<PopupTriggerType, string> = {
  page_load: 'Khi tải trang',
  time_delay: 'Sau khoảng thời gian',
  scroll_percentage: 'Khi cuộn tới %',
  exit_intent: 'Khi khách định thoát trang',
};

export const POPUP_FREQUENCY_LABELS: Record<PopupFrequency, string> = {
  every_visit: 'Mỗi lần truy cập',
  once_per_session: 'Một lần mỗi phiên',
  once_per_day: 'Một lần mỗi ngày',
  once_per_week: 'Một lần mỗi tuần',
};

export const POPUP_POSITION_LABELS: Record<PopupPosition, string> = {
  center: 'Giữa màn hình',
  bottom_left: 'Góc dưới bên trái',
  bottom_right: 'Góc dưới bên phải',
};

export const SLIDER_SOURCE_TYPE_LABELS: Record<SliderSourceType, string> = {
  featured: 'Sản phẩm chọn thủ công',
  collection: 'Theo bộ sưu tập',
};

export const SLIDER_PLACEMENT_POSITION_LABELS: Record<SliderPlacementPosition, string> = {
  above_product_description: 'Trên mô tả sản phẩm',
  below_product_description: 'Dưới mô tả sản phẩm',
  custom_selector: 'Vị trí tùy chỉnh (CSS selector)',
};

/** Build options/choices cho Polaris Select & ChoiceList (đều dùng {label, value}). */
export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): { label: string; value: T }[] {
  return values.map((v) => ({ label: labels[v] ?? v, value: v }));
}
