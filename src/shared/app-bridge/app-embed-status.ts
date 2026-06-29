import { env } from '../config/env';

// Kiểm tra theme app extension (app embed) đã bật trên theme đang publish chưa, bằng
// App Bridge App API `shopify.app.extensions()` (hỗ trợ theme app extension từ 01/2026).
// Ref: https://shopify.dev/docs/api/app-home/apis/authentication-and-data/app-api

export type ActivationStatus = 'active' | 'available' | 'unavailable';

export interface ThemeBlockActivation {
  /** Tên file block/embed trong extension (vd 'popups', 'announcement-bars'). */
  handle: string;
  /** Tên hiển thị (từ schema của block). */
  name: string;
  /** 'section' = app block; 'head'|'body'|'compliance_head' = app embed. */
  target: 'section' | 'head' | 'body' | 'compliance_head';
  /** 'active' = đang có trong theme publish; 'available' = chưa bật; 'unavailable' = bị tắt. */
  status: ActivationStatus;
}

interface ExtensionInfo {
  handle: string;
  type: 'ui_extension' | 'theme_app_extension';
  activations: ThemeBlockActivation[];
}

interface AppBridgeLike {
  app?: { extensions?: () => Promise<ExtensionInfo[]> };
  config?: { shop?: string };
}

export interface AppEmbedStatus {
  /** false nếu App Bridge không hỗ trợ extensions() (App Bridge cũ / dev-mock). */
  supported: boolean;
  /** Các app embed (target head/body) của theme extension + trạng thái. */
  embeds: ThemeBlockActivation[];
  /** Có ít nhất 1 embed và tất cả đều 'active' trên theme publish. */
  allActive: boolean;
}

const EMBED_TARGETS = new Set<ThemeBlockActivation['target']>([
  'head',
  'body',
  'compliance_head',
]);

/** Đọc trạng thái app embed từ App Bridge. Không throw — lỗi/khong hỗ trợ → supported:false. */
export async function getAppEmbedStatus(shopify: unknown): Promise<AppEmbedStatus> {
  const app = (shopify as AppBridgeLike).app;
  if (typeof app?.extensions !== 'function') {
    return { supported: false, embeds: [], allActive: false };
  }

  const extensions = await app.extensions();
  const embeds = extensions
    .filter((e) => e.type === 'theme_app_extension')
    .flatMap((e) => e.activations ?? [])
    .filter((a) => EMBED_TARGETS.has(a.target));

  return {
    supported: true,
    embeds,
    allActive: embeds.length > 0 && embeds.every((e) => e.status === 'active'),
  };
}

/**
 * Deep link mở Theme Editor với app embed bật sẵn (merchant chỉ việc Save).
 * Format app embed: `.../editor?context=apps&activateAppId={api_key}/{handle}`.
 */
export function buildAppEmbedDeepLink(shopify: unknown, handle: string): string | null {
  const shop = (shopify as AppBridgeLike).config?.shop;
  if (!shop) return null;
  return `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${env.VITE_SHOPIFY_API_KEY}/${handle}`;
}
