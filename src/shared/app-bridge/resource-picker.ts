import { useAppBridge } from '@shopify/app-bridge-react';
import { useCallback } from 'react';

// App Bridge Resource Picker (api-contract §7): trả id (gid) + handle. FE CHỈ lưu handle.
interface PickerResource {
  id: string;
  handle: string;
}
interface ShopifyWithPicker {
  resourcePicker: (opts: {
    type: 'product' | 'collection';
    multiple?: boolean;
  }) => Promise<PickerResource[] | undefined>;
}

export const MAX_PRODUCT_HANDLES = 50;

export function useResourcePicker() {
  const shopify = useAppBridge() as unknown as ShopifyWithPicker;

  const pickProducts = useCallback(async (): Promise<string[]> => {
    const selection = await shopify.resourcePicker({ type: 'product', multiple: true });
    // Chỉ lấy handle (không gid); cắt tối đa 50.
    return (selection ?? []).map((r) => r.handle).slice(0, MAX_PRODUCT_HANDLES);
  }, [shopify]);

  const pickCollection = useCallback(async (): Promise<string | undefined> => {
    const selection = await shopify.resourcePicker({ type: 'collection', multiple: false });
    return selection?.[0]?.handle;
  }, [shopify]);

  return { pickProducts, pickCollection };
}
