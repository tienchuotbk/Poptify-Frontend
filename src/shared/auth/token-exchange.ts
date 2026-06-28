import { toApiError } from '../api/api-error';

// POST /api/auth/token-exchange (api-contract §1) — đổi session token → offline token ở BE.
// Dùng raw fetch (KHÔNG qua authenticatedFetch) để tránh đệ quy 401→reExchange.
export async function runTokenExchange(
  getToken: () => Promise<string>,
  baseUrl: string,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${baseUrl}/api/auth/token-exchange`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    const data: unknown = text ? JSON.parse(text) : undefined;
    throw toApiError(res.status, data);
  }
}
