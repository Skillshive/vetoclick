import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary" | "success" | "error";
  icon?: React.ComponentType<any>;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((result: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setOptions(null);
    if (resolvePromise) resolvePromise(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setOptions(null);
    if (resolvePromise) resolvePromise(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        show={isOpen}
        onClose={handleClose}
        onOk={handleConfirm}
        state="pending"
        messages={{
          pending: {
            Icon: (options?.icon as React.ComponentType<any>) || ExclamationTriangleIcon,
            title: options?.title || "Are you sure?",
            description: options?.message || "",
            actionText: options?.confirmLabel || "Confirm",
          },
        }}
        confirmLoading={false}
      />
    </ConfirmContext.Provider>
  );
}