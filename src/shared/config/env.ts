import { parseEnv } from './env.schema';

/** Env runtime đã validate. Import ở entry (`main.tsx`) để fail-fast lúc boot. */
export const env = parseEnv(import.meta.env as unknown as Record<string, unknown>);
