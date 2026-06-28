import { Banner, List } from '@shopify/polaris';
import { ApiError } from '../api/api-error';

// Hiển thị lỗi API dạng Banner top-of-form. Vì BE trả `error` là chuỗi (không field path),
// nhiều message thì list ra, không map vào từng field.
export function ApiErrorBanner({
  error,
  title = 'Có lỗi xảy ra',
}: {
  error: unknown;
  title?: string;
}) {
  const messages =
    error instanceof ApiError
      ? error.messages
      : [(error as Error | undefined)?.message ?? 'Lỗi không xác định'];

  return (
    <Banner tone="critical" title={title}>
      {messages.length > 1 ? (
        <List>
          {messages.map((m, i) => (
            <List.Item key={i}>{m}</List.Item>
          ))}
        </List>
      ) : (
        messages[0]
      )}
    </Banner>
  );
}
