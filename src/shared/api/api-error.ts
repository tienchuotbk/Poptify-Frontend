// Error shape BE (api-contract §2): { statusCode, error, timestamp, path }.
// QUAN TRỌNG: `error` là MỘT CHUỖI (BE join mảng message bằng ', ') → KHÔNG có field path.
// FE tách ', ' thành list để hiển thị Banner top-of-form (KHÔNG map vào từng field).

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  timestamp: string;
  path: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];
  readonly body?: ApiErrorBody;

  constructor(status: number, messages: string[], body?: ApiErrorBody) {
    super(messages.join('; '));
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
    this.body = body;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'string'
  );
}

export function toApiError(status: number, body: unknown): ApiError {
  if (isApiErrorBody(body)) {
    const messages = body.error
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return new ApiError(status, messages.length > 0 ? messages : [body.error], body);
  }
  return new ApiError(status, [`Request failed with status ${status}`]);
}
