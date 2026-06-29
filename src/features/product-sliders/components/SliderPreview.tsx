import { BlockStack, Card, Text } from '@shopify/polaris';
import type { CSSProperties } from 'react';

interface SliderPreviewProps {
  desktopItems: string;
  showArrows: boolean;
  showImage: boolean;
  showPrice: boolean;
}

/**
 * Preview trực tiếp slider theo cấu hình form — render card sản phẩm GIẢ (placeholder)
 * để hình dung số cột / mũi tên / hiện ảnh-giá. Sản phẩm thật do storefront resolve.
 */
export function SliderPreview(props: SliderPreviewProps) {
  const { desktopItems, showArrows, showImage, showPrice } = props;

  const cols = Math.min(Math.max(parseInt(desktopItems || '4', 10) || 4, 1), 5);
  const cards = Array.from({ length: cols + 1 }); // +1 để thấy có thể cuộn

  const track: CSSProperties = {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: `calc((100% - ${(cols - 1) * 12}px) / ${cols})`,
    gap: 12,
    overflow: 'hidden',
  };
  const card: CSSProperties = {
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    padding: 8,
    background: '#fff',
  };

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">
          Xem trước
        </Text>
        <div style={{ position: 'relative', padding: '0 4px' }}>
          {showArrows && (
            <>
              <span style={arrow('left')}>‹</span>
              <span style={arrow('right')}>›</span>
            </>
          )}
          <div style={track}>
            {cards.map((_, i) => (
              <div key={i} style={card}>
                {showImage && (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg,#eceef0,#dfe2e6)',
                    }}
                  />
                )}
                <div
                  style={{
                    marginTop: 8,
                    height: 8,
                    width: '80%',
                    borderRadius: 4,
                    background: '#e3e5e8',
                  }}
                />
                {showPrice && (
                  <div
                    style={{
                      marginTop: 6,
                      height: 10,
                      width: '45%',
                      borderRadius: 4,
                      background: '#cfd3d8',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <Text as="p" tone="subdued" variant="bodySm">
          Card mẫu — sản phẩm thật hiển thị theo nguồn bạn chọn.
        </Text>
      </BlockStack>
    </Card>
  );
}

function arrow(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute',
    top: '38%',
    [side]: -2,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    fontSize: 16,
    color: '#1a1a1a',
  };
}
