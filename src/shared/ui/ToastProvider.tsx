import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast } from '@shopify/polaris';

interface ShowToastOptions {
  error?: boolean;
}

interface ToastContextValue {
  showToast: (content: string, options?: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

interface ToastState {
  content: string;
  error?: boolean;
}

/** Phải nằm trong Polaris <Frame> (Toast render vào toast area của Frame). */
export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((content: string, options?: ShowToastOptions) => {
    setToast({ content, error: options?.error });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast content={toast.content} error={toast.error} onDismiss={() => setToast(null)} />
      )}
    </ToastContext.Provider>
  );
}
