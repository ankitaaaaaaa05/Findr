import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastKind } from '../components/Toast';

interface ToastState { message: string; kind: ToastKind }

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    setToast({ message, kind });
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast
        visible={!!toast}
        message={toast?.message || ''}
        kind={toast?.kind}
        onHide={() => setToast(null)}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
