// Field server-generated chung cho mọi widget response (api-contract §5-7).
export interface BaseWidget {
  id: number;
  publicId: string; // uuid — khóa client storefront, read-only
  shop: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}
