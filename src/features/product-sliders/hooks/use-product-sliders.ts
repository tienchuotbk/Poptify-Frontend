import { createWidgetHooks } from '../../../shared/api/widget-crud';
import { queryKeys } from '../../../shared/api/query-keys';
import {
  type CreateProductSlider,
  type ProductSlider,
  type UpdateProductSlider,
} from '../../../shared/types';

export const sliderHooks = createWidgetHooks<
  ProductSlider,
  CreateProductSlider,
  UpdateProductSlider
>('/api/product-sliders', queryKeys.productSliders);
