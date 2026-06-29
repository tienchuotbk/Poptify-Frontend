import { BlockStack, Card, Text } from '@shopify/polaris';
import type { CSSProperties } from 'react';
import type { PopupPosition } from '../../../shared/types';

interface PopupPreviewProps {
  title: string;
  description: string;
  couponCode: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  imageUrl: string;
  showCloseButton: boolean;
  position: PopupPosition;
}

/**
 * Preview trực tiếp popup theo giá trị form (mô phỏng storefront, không phải render
 * thật). Cập nhật realtime khi merchant gõ — giúp hình dung trước khi lưu.
 */
export function PopupPreview(props: PopupPreviewProps) {
  const {
    title,
    description,
    couponCode,
    buttonText,
    backgroundColor,
    textColor,
    imageUrl,
    showCloseButton,
    position,
  } = props;

  const bg = backgroundColor || '#ffffff';
  const fg = textColor || '#1a1a1a';
  const hasContent = title || description || couponCode || buttonText || imageUrl;

  const backdrop: CSSProperties = {
    display: 'flex',
    alignItems: position === 'center' ? 'center' : 'flex-end',
    justifyContent:
      position === 'bottom_left'
        ? 'flex-start'
        : position === 'bottom_right'
          ? 'flex-end'
          : 'center',
    minHeight: 340,
    padding: 16,
    borderRadius: 12,
    background: 'repeating-linear-gradient(45deg,#f1f2f4,#f1f2f4 12px,#e9eaec 12px,#e9eaec 24px)',
    overflow: 'hidden',
  };

  const box: CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: 280,
    padding: '24px 20px',
    background: bg,
    color: fg,
    borderRadius: 14,
    boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
    textAlign: position === 'center' ? 'center' : 'left',
  };

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">
          Xem trước
        </Text>
        <div style={backdrop}>
          {hasContent ? (
            <div style={box}>
              {showCloseButton && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 10,
                    fontSize: 18,
                    lineHeight: 1,
                    opacity: 0.6,
                  }}
                >
                  ×
                </span>
              )}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  style={{
                    display: 'block',
                    width: '100%',
                    maxHeight: 100,
                    objectFit: 'cover',
                    borderRadius: 10,
                    marginBottom: 12,
                  }}
                />
              )}
              {title && (
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              )}
              {description && (
                <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>{description}</div>
              )}
              {couponCode && (
                <div
                  style={{
                    display: 'inline-block',
                    margin: '12px 0',
                    padding: '8px 14px',
                    border: '2px dashed currentColor',
                    borderRadius: 8,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {couponCode}
                </div>
              )}
              {buttonText && (
                <div
                  style={{
                    // Nút = đảo màu popup (nền=màu chữ, chữ=màu nền) — khớp storefront.
                    marginTop: 12,
                    padding: '11px 18px',
                    background: fg,
                    color: bg,
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  {buttonText}
                </div>
              )}
            </div>
          ) : (
            <Text as="p" tone="subdued">
              Nhập nội dung để xem trước
            </Text>
          )}
        </div>
        <Text as="p" tone="subdued" variant="bodySm">
          Preview mô phỏng — giao diện thật trên storefront có thể khác đôi chút.
        </Text>
      </BlockStack>
    </Card>
  );
}
