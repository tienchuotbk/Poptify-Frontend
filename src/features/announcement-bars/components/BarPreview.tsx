import { BlockStack, Card, Text } from '@shopify/polaris';
import type { CSSProperties } from 'react';
import type { AnnouncementBarType } from '../../../shared/types';

interface BarPreviewProps {
  type: AnnouncementBarType;
  text: string;
  buttonText: string;
  progressText: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Preview trực tiếp thanh thông báo theo giá trị form (mô phỏng storefront).
 * countdown hiển thị bộ đếm mẫu; free_shipping_progress hiển thị thanh tiến trình mẫu.
 */
export function BarPreview(props: BarPreviewProps) {
  const { type, text, buttonText, progressText, backgroundColor, textColor } = props;

  const bg = backgroundColor || '#1a1a1a';
  const fg = textColor || '#ffffff';

  const bar: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    minHeight: 44,
    padding: '10px 16px',
    background: bg,
    color: fg,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  };
  const pill: CSSProperties = {
    padding: '6px 14px',
    background: fg,
    color: bg,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
  };

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">
          Xem trước
        </Text>
        <div style={bar}>
          {type === 'simple' && (
            <>
              <span>{text || 'Nội dung thanh thông báo'}</span>
              {buttonText && <span style={pill}>{buttonText}</span>}
            </>
          )}
          {type === 'countdown' && (
            <>
              <span>{text || 'Ưu đãi kết thúc sau'}</span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.18)',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                01d 12:34:56
              </span>
            </>
          )}
          {type === 'free_shipping_progress' && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ marginBottom: 6 }}>
                {progressText || 'Mua thêm để được miễn phí vận chuyển!'}
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.25)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '55%',
                    background: fg,
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <Text as="p" tone="subdued" variant="bodySm">
          Preview mô phỏng — countdown/tiến trình dùng dữ liệu mẫu.
        </Text>
      </BlockStack>
    </Card>
  );
}
