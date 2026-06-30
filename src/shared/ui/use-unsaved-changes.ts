import { useEffect, useRef } from 'react';

/**
 * Theo dõi "có thay đổi chưa lưu" (dirty) để bật/tắt contextual save bar và để
 * khôi phục form khi Hủy.
 *
 * - `dirty`: ảnh chụp hiện tại khác baseline.
 * - `baseline`: ref giữ snapshot gốc — dùng `applyValues(baseline.current)` để revert.
 * - `requestRebaseline()`: cập nhật baseline ở lần render KẾ TIẾP. Dùng trong effect
 *   nạp dữ liệu (edit): lúc gọi, các setState mới chưa phản ánh vào `values` của render
 *   hiện tại, nên ta hoãn tới render sau (khi state đã áp dụng).
 * - `reset()`: cập nhật baseline = giá trị hiện tại NGAY (sau khi lưu thành công, để
 *   dirty về false trước khi điều hướng → tránh App Bridge cảnh báo nhầm).
 */
export function useUnsavedChanges<T>(values: T) {
  const baseline = useRef<T>(values);
  const pending = useRef(false);
  const serialized = JSON.stringify(values);

  useEffect(() => {
    if (pending.current) {
      baseline.current = values;
      pending.current = false;
    }
    // Cố ý chỉ phụ thuộc `serialized` (giá trị ổn định) thay vì `values`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  const dirty = JSON.stringify(baseline.current) !== serialized;
  const requestRebaseline = () => {
    pending.current = true;
  };
  const reset = () => {
    baseline.current = values;
  };

  return { dirty, baseline, requestRebaseline, reset };
}
