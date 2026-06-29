import { parseEnv } from './env.schema';

/** Env runtime đã validate. Import ở entry (`main.tsx`) để fail-fast lúc boot. */
const parsed = parseEnv(import.meta.env as unknown as Record<string, unknown>);

export const env = {
  ...parsed,
  // Cắt dấu '/' cuối: tránh `${base}/api/...` thành `//api/...` → server 301 normalize
  // → POST tụt thành GET → 404 "Cannot GET". Chuẩn hóa 1 chỗ cho mọi caller.
  VITE_API_BASE_URL: parsed.VITE_API_BASE_URL.replace(/\/+$/, ''),
};
