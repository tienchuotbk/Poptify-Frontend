import { SaveBar } from '@shopify/app-bridge-react';
import type { ButtonHTMLAttributes } from 'react';

// Nút trong SaveBar là web-component button của App Bridge:
//   variant="primary" → nút Lưu, không variant → nút Hủy, loading="" → đang lưu.
// Các thuộc tính này không có trong type <button> chuẩn của React nên mở rộng tại đây.
type AppBridgeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary';
  loading?: string;
};

interface FormSaveBarProps {
  id: string;
  /** Bật save bar khi form có thay đổi chưa lưu. */
  open: boolean;
  /** Đang lưu → nút Lưu hiển thị loading, nút Hủy bị khoá. */
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
  discardLabel?: string;
}

/**
 * Contextual save bar (App Bridge) hiện ở đỉnh Shopify Admin khi form dirty — để
 * merchant lưu/huỷ mà không phải cuộn xuống cuối trang. Khi `open` và merchant rời
 * trang, App Bridge tự cảnh báo "thay đổi chưa lưu".
 * Ref: https://shopify.dev/docs/api/app-bridge-library/react-components/save-bar
 */
export function FormSaveBar({
  id,
  open,
  saving,
  onSave,
  onDiscard,
  saveLabel = 'Lưu',
  discardLabel = 'Hủy',
}: FormSaveBarProps) {
  const saveProps: AppBridgeButtonProps = { variant: 'primary', onClick: onSave };
  if (saving) saveProps.loading = '';

  return (
    <SaveBar id={id} open={open}>
      <button {...saveProps}>{saveLabel}</button>
      <button onClick={onDiscard} disabled={saving}>
        {discardLabel}
      </button>
    </SaveBar>
  );
}
