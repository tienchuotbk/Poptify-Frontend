import { z } from 'zod';

/**
 * Schema env public (VITE_*). Pure — test được không cần `import.meta`.
 * Chỉ 2 biến public; KHÔNG có secret (xem `.env.example`).
 */
export const envSchema = z.object({
  VITE_SHOPIFY_API_KEY: z.string().min(1, 'VITE_SHOPIFY_API_KEY is required'),
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
});

export type Env = z.infer<typeof envSchema>;

/** Fail-fast: throw với thông điệp rõ ràng khi env thiếu/sai. */
export function parseEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`[env] Invalid configuration: ${issues}`);
  }
  return result.data;
}
