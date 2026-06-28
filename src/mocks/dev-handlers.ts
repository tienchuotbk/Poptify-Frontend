import { http, HttpResponse } from 'msw';
import type {
  AnnouncementBar,
  AppSettings,
  Popup,
  ProductSlider,
} from '../shared/types';

// Dev preview store (in-memory, CRUD thật) — chỉ dùng khi VITE_DEV_MOCK=true.
const TS = '2026-06-28T00:00:00.000Z';
let idSeq = 100;
const nextId = () => ++idSeq;

const appSettings: AppSettings = {
  id: 1,
  shop: 'dev.myshopify.com',
  appEnabled: true,
  deviceTarget: 'all',
  globalPageTarget: 'all',
  startDate: null,
  endDate: null,
  timezone: 'Asia/Ho_Chi_Minh',
  createdAt: TS,
  updatedAt: TS,
};

const popups: Popup[] = [
  {
    id: 1,
    publicId: 'pub-popup-1',
    shop: 'dev.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Giảm 10% cho khách mới',
    type: 'discount',
    enabled: true,
    contentConfig: { title: 'Chào mừng!', couponCode: 'WELCOME10' },
  },
  {
    id: 2,
    publicId: 'pub-popup-2',
    shop: 'dev.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Đăng ký nhận tin',
    type: 'newsletter',
    enabled: false,
  },
];

const bars: AnnouncementBar[] = [
  {
    id: 1,
    publicId: 'pub-bar-1',
    shop: 'dev.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Miễn phí ship đơn từ 500k',
    type: 'free_shipping_progress',
    enabled: true,
    position: 'top',
  },
];

const sliders: ProductSlider[] = [
  {
    id: 1,
    publicId: 'pub-slider-1',
    shop: 'dev.myshopify.com',
    schemaVersion: 1,
    createdAt: TS,
    updatedAt: TS,
    name: 'Sản phẩm nổi bật',
    sourceType: 'featured',
    enabled: true,
    sourceConfig: { productHandles: ['ao-thun-basic', 'quan-jean'] },
  },
];

interface WidgetLike {
  id: number;
  publicId: string;
  shop: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}

// CRUD handlers generic cho 1 collection.
function collectionHandlers<T extends WidgetLike>(base: string, store: T[], prefix: string) {
  return [
    http.get(`*${base}`, () => HttpResponse.json(store)),
    http.post(`*${base}`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const id = nextId();
      const item = {
        id,
        publicId: `${prefix}-${id}`,
        shop: 'dev.myshopify.com',
        schemaVersion: 1,
        createdAt: TS,
        updatedAt: TS,
        enabled: false,
        ...body,
      } as unknown as T;
      store.push(item);
      return HttpResponse.json(item, { status: 201 });
    }),
    http.get(`*${base}/:id`, ({ params }) => {
      const item = store.find((x) => x.id === Number(params.id));
      return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
    }),
    http.patch(`*${base}/:id`, async ({ params, request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const item = store.find((x) => x.id === Number(params.id));
      if (!item) return new HttpResponse(null, { status: 404 });
      Object.assign(item, body, { updatedAt: TS });
      return HttpResponse.json(item);
    }),
    http.delete(`*${base}/:id`, ({ params }) => {
      const idx = store.findIndex((x) => x.id === Number(params.id));
      if (idx >= 0) store.splice(idx, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

export const devHandlers = [
  http.post('*/api/auth/token-exchange', () =>
    HttpResponse.json({ shop: 'dev.myshopify.com', installed: true }),
  ),
  http.get('*/api/app-settings', () => HttpResponse.json(appSettings)),
  http.put('*/api/app-settings', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(appSettings, body, { updatedAt: TS });
    return HttpResponse.json(appSettings);
  }),
  ...collectionHandlers('/api/popups', popups, 'pub-popup'),
  ...collectionHandlers('/api/announcement-bars', bars, 'pub-bar'),
  ...collectionHandlers('/api/product-sliders', sliders, 'pub-slider'),
];
