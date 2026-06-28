import { toApiError } from './api-error';
import { type AuthenticatedFetch } from './authenticated-fetch';

// Client REST thuần (nhận AuthenticatedFetch injected). Parse JSON, throw ApiError khi !ok,
// xử lý 204 No Content.
export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  del(path: string): Promise<void>;
}

export function createApiClient(fetcher: AuthenticatedFetch): ApiClient {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const hasBody = body !== undefined;
    const res = await fetcher(path, {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) {
      return undefined as T;
    }

    const text = await res.text();
    const data: unknown = text ? JSON.parse(text) : undefined;

    if (!res.ok) {
      throw toApiError(res.status, data);
    }
    return data as T;
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    del: async (path: string) => {
      await request<void>('DELETE', path);
    },
  };
}
