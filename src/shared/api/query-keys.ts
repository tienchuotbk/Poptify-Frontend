// Query-key factory mỗi domain → invalidate list/detail nhất quán sau mutation.
export const queryKeys = {
  appSettings: ['app-settings'] as const,
  popups: {
    all: ['popups'] as const,
    detail: (id: number) => ['popups', id] as const,
  },
  announcementBars: {
    all: ['announcement-bars'] as const,
    detail: (id: number) => ['announcement-bars', id] as const,
  },
  productSliders: {
    all: ['product-sliders'] as const,
    detail: (id: number) => ['product-sliders', id] as const,
  },
};
