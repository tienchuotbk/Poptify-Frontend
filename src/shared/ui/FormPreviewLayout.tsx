import type { ReactNode } from 'react';
import './FormPreviewLayout.css';

interface FormPreviewLayoutProps {
  form: ReactNode;
  preview: ReactNode;
}

/**
 * Hai cột: form (rộng) + preview dính (sticky) bên phải. Trên mobile xếp dọc,
 * form trước rồi preview. Xem FormPreviewLayout.css để biết vì sao dùng grid
 * thay cho Polaris <Layout>.
 */
export function FormPreviewLayout({ form, preview }: FormPreviewLayoutProps) {
  return (
    <div className="poptify-fp">
      <div className="poptify-fp__main">{form}</div>
      <aside className="poptify-fp__aside">{preview}</aside>
    </div>
  );
}
