import type {
  PopupFrequency,
  PopupPosition,
  PopupTriggerType,
  PopupType,
} from '../../shared/types';

// Mẫu popup dựng sẵn — bấm "Dùng mẫu" để điền nhanh form. Không động tới `name`
// (merchant tự đặt). Giá trị `apply` map thẳng vào state của PopupFormPage.
export interface PopupTemplate {
  id: string;
  label: string;
  description: string;
  apply: {
    type: PopupType;
    triggerType?: PopupTriggerType;
    triggerValue?: string;
    frequency?: PopupFrequency;
    position?: PopupPosition;
    backgroundColor?: string;
    textColor?: string;
    title?: string;
    description?: string;
    couponCode?: string;
    buttonText?: string;
    successMessage?: string;
  };
}

export const POPUP_TEMPLATES: PopupTemplate[] = [
  {
    id: 'welcome-discount',
    label: '🎉 Giảm giá chào mừng',
    description: 'Tặng mã giảm giá cho khách mới khi vào trang.',
    apply: {
      type: 'discount',
      triggerType: 'time_delay',
      triggerValue: '5',
      frequency: 'once_per_day',
      position: 'center',
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      title: 'Giảm 10% cho đơn đầu tiên!',
      description: 'Dùng mã bên dưới khi thanh toán để được giảm giá.',
      couponCode: 'WELCOME10',
      buttonText: 'Mua ngay',
    },
  },
  {
    id: 'newsletter',
    label: '✉️ Đăng ký nhận tin',
    description: 'Thu thập email, hiện góc dưới phải, 1 lần/tuần.',
    apply: {
      type: 'newsletter',
      triggerType: 'time_delay',
      triggerValue: '8',
      frequency: 'once_per_week',
      position: 'bottom_right',
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      title: 'Đừng bỏ lỡ ưu đãi!',
      description: 'Nhập email để nhận tin khuyến mãi mới nhất.',
      buttonText: 'Đăng ký',
      successMessage: 'Cảm ơn bạn đã đăng ký!',
    },
  },
  {
    id: 'exit-intent',
    label: '🚪 Giữ chân khách rời trang',
    description: 'Hiện khi khách định thoát, tặng ưu đãi níu giữ.',
    apply: {
      type: 'exit_intent',
      triggerType: 'exit_intent',
      frequency: 'once_per_session',
      position: 'center',
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      title: 'Khoan đã! 🎁',
      description: 'Nhận ngay ưu đãi đặc biệt trước khi rời đi.',
      couponCode: 'STAY15',
      buttonText: 'Nhận ưu đãi',
    },
  },
  {
    id: 'flash-sale',
    label: '⚡ Flash Sale',
    description: 'Tông tối nổi bật, hối thúc mua ngay.',
    apply: {
      type: 'discount',
      triggerType: 'page_load',
      frequency: 'every_visit',
      position: 'center',
      backgroundColor: '#111827',
      textColor: '#ffffff',
      title: '⚡ Flash Sale 30%',
      description: 'Chỉ hôm nay — số lượng có hạn!',
      couponCode: 'FLASH30',
      buttonText: 'Săn deal ngay',
    },
  },
];
