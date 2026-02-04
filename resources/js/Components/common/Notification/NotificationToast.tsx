import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import clsx from 'clsx';
import { useTranslation } from '@/hooks/useTranslation';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const icons = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const colors = {
    success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-200',
    error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-800 dark:text-error-200',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
    info: 'bg-info-50 border-info-200 text-info-800 dark:bg-info-900/20 dark:border-info-800 dark:text-info-200',
  };

  const Icon = icons[notification.type];
  const { t } = useTranslation();
  // Add wrapper for fixed right bottom positioning
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={clsx(
          'min-w-[320px] max-w-md rounded-lg border p-4 shadow-lg transition-all duration-300',
          colors[notification.type]
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold">{t(notification.title)}</h4>
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <XMarkIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

