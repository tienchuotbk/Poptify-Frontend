# Poptify Frontend (Admin UI) 

Shopify **embedded admin app** (Vite + React + TypeScript + Polaris React + App Bridge v4)
tiêu thụ REST API của Poptify Backend. Cấu hình **App Settings / Popups / Announcement Bars /
Product Sliders**. Hợp đồng API: `../backend/docs/api-contract.md`. Spec: `spec.md`, kế hoạch: `Plans.md`. 

## Stack

- **Vite 5** + **React 18** + **TypeScript** (strict)
- **@shopify/polaris** (React, KHÔNG web components `<s-*>`) + `<AppProvider i18n>`
- **@shopify/app-bridge-react v4** — load qua CDN script trong `index.html`, auth bằng session token (`idToken()`)
- **@tanstack/react-query** (server state) · **react-router-dom** (routing)
- **Vitest + React Testing Library + MSW** (test headless)

## Bắt đầu

```bash
npm install
cp .env.example .env     # điền VITE_SHOPIFY_API_KEY + VITE_API_BASE_URL
npm run dev
```

> App chạy **embedded trong Shopify Admin iframe** (App Bridge cần admin context). Để verify thật,
> dùng tunnel `shopify app dev` rồi mở app trong Admin — KHÔNG mở `localhost` trực tiếp.

### Env (chỉ biến public — Vite inline vào bundle, KHÔNG đặt secret)

| Biến | Ý nghĩa |
|---|---|
| `VITE_SHOPIFY_API_KEY` | Shopify app **client API key** (public) — inject vào `data-api-key` của App Bridge CDN script |
| `VITE_API_BASE_URL` | Base URL của Backend REST API |

## Scripts

| Lệnh | Việc |
|---|---|
| `npm run dev` | Vite dev server (proxy `/api` → `VITE_API_BASE_URL`) |
| `npm run build` | `tsc --noEmit` + `vite build` (sourcemap OFF ở production) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (headless, MSW mock API) |
| `npm run ci` | lint + typecheck + test + build (cổng CI) |

## Cấu trúc (feature-based)

```
src/
  features/<domain>/{api,hooks,pages}/   # app-settings, popups, announcement-bars, product-sliders
  shared/
    api/        # authenticatedFetch, apiClient, query (TanStack), error parse
    auth/       # AuthBootstrap (token-exchange gate), useSessionToken
    types/      # type mirror api-contract + enums (nguồn duy nhất)
    ui/         # ErrorBoundary, ToastProvider, ApiErrorBanner, AppNavigation
    validation/ # client-validation mirror BE (https, hex, no-'<')
    app-bridge/ # resource picker (→ chỉ lưu handle)
    test/       # MSW server/handlers/fixtures + renderWithProviders
```

## Kiểm thử — ranh giới CI vs Admin

- **CI (cổng tự động, headless):** `npm run ci`. Chạy Vitest/RTL với **MSW** mock API + App Bridge mock.
  KHÔNG cần Shopify Admin/tunnel/credentials thật → ổn định, nhanh. Đây là cổng bắt buộc xanh trước merge.
- **E2E trong Admin (THỦ CÔNG, không vào CI):** mở app embedded qua `shopify app dev` (tunnel) trong
  Shopify Admin iframe, verify token-exchange + CRUD thật, dùng `playwright-cli --headed` + lưu `evidence/`.
  KHÔNG đưa tunnel/OAuth/store thật vào CI (flaky + secret).

## Bảo mật (đã enforce)

- Session token lấy **fresh mỗi request** qua App Bridge `idToken()` — KHÔNG persist (localStorage/cookie), KHÔNG log.
- Auth bằng header `Authorization: Bearer` (KHÔNG cookie) → kháng CSRF. KHÔNG gửi `shop` (BE suy từ token).
- KHÔNG `dangerouslySetInnerHTML`; URL/màu validate `https`/hex; sourcemap OFF ở production.
- 401 → re-token-exchange **1 lần** rồi retry **1 lần** (không loop).

> **Deploy (chưa chốt):** host phục vụ SPA phải set `Content-Security-Policy: frame-ancestors
> https://*.myshopify.com https://admin.shopify.com` và KHÔNG set `X-Frame-Options: DENY/SAMEORIGIN`.
> BE phải bật CORS cho origin app (`Allow-Headers: Authorization`, methods `GET,POST,PATCH,DELETE`).
> Xem `spec.md` §7 Q1/Q2.
