import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Toast {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons = {
  success: <CheckCircleIcon className="size-6 text-[#4DB9AD]" />,
  warning: <ExclamationTriangleIcon className="size-6 text-yellow-500" />,
  error: <XCircleIcon className="size-6 text-red-500" />,
  info: <InformationCircleIcon className="size-6 text-blue-500" />,
};

const borderColors = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(({ type, message, duration = 3000 }: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="overflow-hidden rounded-lg bg-white shadow-lg w-80"
          >
            <div className="flex bg-gray-50">
              <div className={`w-1.5 shrink-0 ${borderColors[toast.type]}`}></div>
              <div className="flex items-center gap-3 px-4 py-3">
                {icons[toast.type]}
                <p className="text-gray-800 text-sm">{toast.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 