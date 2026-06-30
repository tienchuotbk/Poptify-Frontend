import { TextField } from '@shopify/polaris';

const FULL_HEX = /^#[0-9a-fA-F]{6}$/;

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Hex mặc định gợi ý (hiển thị trên swatch khi chưa nhập). */
  placeholder?: string;
  error?: string;
  helpText?: string;
}

/**
 * Ô chọn màu = TextField hex + swatch màu thật (native color picker) gắn bên trái.
 * Merchant có thể bấm swatch để chọn trực quan hoặc gõ tay hex. Để trống = dùng
 * màu mặc định của widget (BE/storefront tự áp), swatch hiển thị màu placeholder.
 */
export function ColorField({ label, value, onChange, placeholder, error, helpText }: ColorFieldProps) {
  const fallback = placeholder && FULL_HEX.test(placeholder) ? placeholder : '#ffffff';
  const swatch = FULL_HEX.test(value) ? value : fallback;

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      autoComplete="off"
      placeholder={placeholder}
      error={error}
      helpText={helpText}
      connectedLeft={
        <input
          type="color"
          aria-label={`${label}: chọn màu`}
          value={swatch}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 40,
            height: 32,
            padding: 2,
            border: '1px solid var(--p-color-input-border, #8a8a8a)',
            borderRadius: 'var(--p-border-radius-200, 8px)',
            background: 'var(--p-color-bg-surface, #fff)',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        />
      }
    />
  );
}
