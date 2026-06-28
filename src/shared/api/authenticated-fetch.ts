// authenticatedFetch (api-contract §1): gắn `Authorization: Bearer <session token>` mỗi request.
// - Token lấy FRESH mỗi request (sống ~1 phút) — KHÔNG persist/cache/log.
// - KHÔNG `credentials:'include'` (Bearer header, kháng CSRF).
// - 401 → re-token-exchange ≤1 lần → retry ≤1 lần → trả response (KHÔNG loop vô hạn).
// Factory thuần (deps injected) → test được không cần App Bridge.

export interface AuthenticatedFetchDeps {
  /** Lấy session token mới (App Bridge idToken). Gọi mỗi request. */
  getToken: () => Promise<string>;
  /** Base URL của BE. */
  baseUrl: string;
  /** Re-run token-exchange (gọi đúng 1 lần khi gặp 401). */
  reExchange: () => Promise<void>;
}

export type AuthenticatedFetch = (path: string, init?: RequestInit) => Promise<Response>;

export function createAuthenticatedFetch(deps: AuthenticatedFetchDeps): AuthenticatedFetch {
  const doFetch = async (path: string, init: RequestInit): Promise<Response> => {
    const token = await deps.getToken(); // fresh — không cache
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${deps.baseUrl}${path}`, { ...init, headers });
  };

  return async function authenticatedFetch(path, init = {}) {
    let res = await doFetch(path, init);
    if (res.status === 401) {
      // Bounded: re-exchange một lần rồi retry một lần. Nếu vẫn 401 → trả về (fail), không loop.
      await deps.reExchange();
      res = await doFetch(path, init);
    }
    return res;
  };
}
