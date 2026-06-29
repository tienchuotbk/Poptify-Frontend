import type { AnnouncementBarPosition, AnnouncementBarType } from '../../shared/types';

// Mẫu thanh thông báo dựng sẵn. `apply` map thẳng vào state của AnnouncementBarFormPage
// (không động `name`). Countdown cần `endDate` — merchant tự chọn sau.
export interface BarTemplate {
  id: string;
  label: string;
  description: string;
  apply: {
    type: AnnouncementBarType;
    position?: AnnouncementBarPosition;
    sticky?: boolean;
    backgroundColor?: string;
    textColor?: string;
    text?: string;
    buttonText?: string;
    expiredMessage?: string;
    goalAmount?: string;
    progressText?: string;
    successText?: string;
  };
}

export const BAR_TEMPLATES: BarTemplate[] = [
  {
    id: 'simple-promo',
    label: '🚚 Thông báo khuyến mãi',
    description: 'Thanh đơn giản kèm nút kêu gọi hành động.',
    apply: {
      type: 'simple',
      position: 'top',
      sticky: true,
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      text: '🚚 Miễn phí vận chuyển cho đơn từ 500K',
      buttonText: 'Mua ngay',
    },
  },
  {
    id: 'free-shipping',
    label: '📦 Tiến trình freeship',
    description: 'Thanh tiến trình "mua thêm để được freeship".',
    apply: {
      type: 'free_shipping_progress',
      position: 'top',
      sticky: true,
      backgroundColor: '#0f7b4f',
      textColor: '#ffffff',
      goalAmount: '500000',
      progressText: 'Mua thêm để được MIỄN PHÍ vận chuyển!',
      successText: 'Bạn đã được miễn phí vận chuyển! 🎉',
    },
  },
  {
    id: 'flash-countdown',
    label: '⏰ Đếm ngược Flash Sale',
    description: 'Tông nóng, thúc giục mua trước khi hết giờ (tự đặt thời gian).',
    apply: {
      type: 'countdown',
      position: 'top',
      sticky: true,
      backgroundColor: '#b42318',
      textColor: '#ffffff',
      expiredMessage: 'Ưu đãi đã kết thúc!',
    },
  },
];
