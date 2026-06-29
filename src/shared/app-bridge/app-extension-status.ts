import { env } from '../config/env';

// Trạng thái theme app extension (app embed + app block) qua App Bridge App API
// `shopify.app.extensions()`. Ref:
// https://shopify.dev/docs/api/app-home/apis/authentication-and-data/app-api

export type ActivationStatus = 'active' | 'available' | 'unavailable';

export interface ThemeBlockActivation {
  /** Tên file block/embed trong extension (vd 'popups', 'announcement-bars', 'product-slider'). */
  handle: string;
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

export interface AppExtensionStatus {
  /** false nếu App Bridge không hỗ trợ extensions() (App Bridge cũ / dev-mock). */
  supported: boolean;
  /** Tất cả block/embed của theme app extension (mọi target). */
  blocks: ThemeBlockActivation[];
}

/** Đọc trạng thái extension từ App Bridge. Không throw — lỗi/không hỗ trợ → supported:false. */
export async function getAppExtensionStatus(shopify: unknown): Promise<AppExtensionStatus> {
  const app = (shopify as AppBridgeLike).app;
  if (typeof app?.extensions !== 'function') {
    return { supported: false, blocks: [] };
  }
  const extensions = await app.extensions();
  const blocks = extensions
    .filter((e) => e.type === 'theme_app_extension')
    .flatMap((e) => e.activations ?? []);
  return { supported: true, blocks };
}

export function findBlock(
  status: AppExtensionStatus,
  handle: string,
): ThemeBlockActivation | undefined {
  return status.blocks.find((b) => b.handle === handle);
}

/** Block/embed đang active trên theme publish (status==='active'). */
export function isBlockActive(status: AppExtensionStatus, handle: string): boolean {
  return status.supported && findBlock(status, handle)?.status === 'active';
}

/** Deep link bật APP EMBED (target head/body) trong Theme Editor → App embeds. */
export function buildAppEmbedDeepLink(shopify: unknown, handle: string): string | null {
  const shop = (shopify as AppBridgeLike).config?.shop;
  if (!shop) return null;
  return `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${env.VITE_SHOPIFY_API_KEY}/${handle}`;
}

/** Deep link thêm APP BLOCK (target section, vd product slider) vào template. */
export function buildAppBlockDeepLink(
  shopify: unknown,
  handle: string,
  template = 'product',
): string | null {
  const shop = (shopify as AppBridgeLike).config?.shop;
  if (!shop) return null;
  return `https://${shop}/admin/themes/current/editor?template=${template}&addAppBlockId=${env.VITE_SHOPIFY_API_KEY}/${handle}`;
}
