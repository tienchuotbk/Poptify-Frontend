// Client-side validation MIRROR BE (chỉ để UX fail sớm — BE vẫn là nguồn xác thực duy nhất).
// api-contract §2: URL chỉ `https://`, màu = hex `#rrggbb`.

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

/** Chặn scheme nguy hiểm trước khi gán href/src trong preview (XSS). Trả '' nếu không an toàn. */
export function safeHttpsHref(value: string): string {
  return isHttpsUrl(value) ? value : '';
}

export interface FieldError {
  field: string;
  message: string;
}

export function validateRequired(field: string, value: string, max = 255): FieldError | null {
  if (!value.trim()) return { field, message: `${field} không được để trống` };
  if (value.length > max) return { field, message: `${field} tối đa ${max} ký tự` };
  return null;
}

export function validateHttpsOptional(field: string, value: string): FieldError | null {
  if (!value) return null;
  return isHttpsUrl(value) ? null : { field, message: `${field} phải là URL https://` };
}

export function validateHexOptional(field: string, value: string): FieldError | null {
  if (!value) return null;
  return isHexColor(value) ? null : { field, message: `${field} phải là mã màu hex (#rrggbb)` };
}

/** CSS selector không được chứa '<' (api-contract §7). */
export function validateNoAngleBracket(field: string, value: string): FieldError | null {
  if (!value) return null;
  return value.includes('<') ? { field, message: `${field} không được chứa ký tự '<'` } : null;
}
