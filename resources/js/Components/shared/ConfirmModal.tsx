// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import merge from "lodash/merge";
import { ElementType, useRef } from "react";

// Local Imports
import { Button, GhostSpinner } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { AnimatedTick } from "./AnimatedTick";
import { Modal } from "@/components/ui/Modal";

// ----------------------------------------------------------------------

export type ModalState = "pending" | "success" | "error";

interface MessageConfig {
  Icon: ElementType;
  iconClassName?: string;
  title: string;
  description: string;
  actionText: string;
}

interface Messages {
  pending: MessageConfig;
  success: MessageConfig;
  error: MessageConfig;
}

export interface ConfirmProps {
  onOk: () => void;
  onClose: () => void;
  state: ModalState;
  messages?: ConfirmMessages;
  confirmLoading?: boolean;
}

export type ConfirmMessages = {
  [K in ModalState]?: Partial<MessageConfig>;
};

export function ConfirmModal({
  show,
  onClose,
  onOk,
  confirmLoading,
  className,
  state,
  messages,
}: ConfirmProps & { show: boolean; className?: string }) {
  const focusRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();


  // Fallback translations for when translation system is not available
  const fallbackTranslations = {
    'common.are_you_sure': 'Are you sure?',
    'common.confirm_delete_default': 'Are you sure you want to delete this record? Once deleted, it cannot be restored.',
    'common.delete': 'Delete',
    'common.deleted': 'Deleted',
    'common.delete_success_default': 'You have successfully deleted the record from the database.',
    'common.done': 'Done',
    'common.error_occurred': 'Oops... Something failed.',
    'common.error_description': 'Ensure internet is on and retry. Contact support if issue remains.',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
  };

  const safeT = (key: string) => {
    const translation = t(key);
    // If translation returns the key itself (meaning no translation found), use fallback
    return translation === key ? (fallbackTranslations[key] || key) : translation;
  };

  const defaultMessages: Messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      iconClassName: "text-warning",
      title: safeT('common.are_you_sure'),
      description: safeT('common.confirm_delete_default'),
      actionText: safeT('common.delete'),
    },
    success: {
      Icon: AnimatedTick,
      iconClassName: "text-success",
      title: safeT('common.deleted'),
      description: safeT('common.delete_success_default'),
      actionText: safeT('common.done'),
    },
    error: {
      Icon: XCircleIcon,
      title: safeT('common.error_occurred'),
      description: safeT('common.error_description'),
      actionText: safeT('common.retry'),
      iconClassName: "text-error",
    },
  };

  const mergedMessages = merge(defaultMessages, messages);
  const Icon = mergedMessages[state].Icon;
  const spinner = <GhostSpinner variant="soft" className="size-4 border-2 mr-2" />;

  // Actions area
  let actions = null;
  if (state === "success") {
    actions = (
      <Button onClick={onClose} color="success" className="h-10 min-w-[8rem] rounded-full shadow-md">
        {mergedMessages[state].actionText}
      </Button>
    );
  } else if (state === "pending") {
    actions = (
      <div className="flex gap-3 justify-end">
        <Button onClick={onClose} variant="outlined" className="h-10 min-w-[8rem] rounded-full">
          {safeT('common.cancel')}
        </Button>
        <Button
          ref={focusRef}
          onClick={onOk}
          color={mergedMessages[state].actionColor || 'primary'}
          className="h-10 min-w-[8rem] rounded-full shadow-md"
          disabled={confirmLoading}
        >
          {confirmLoading && spinner}
          <span>{mergedMessages[state].actionText}</span>
        </Button>
      </div>
    );
  } else if (state === "error") {
    actions = (
      <div className="flex gap-3 justify-end">
        <Button onClick={onClose} variant="outlined" className="h-10 min-w-[8rem] rounded-full">
          {safeT('common.cancel')}
        </Button>
        <Button
          onClick={onOk}
          color="error"
          className="h-10 min-w-[8rem] shadow-md"
          disabled={confirmLoading}
        >
          {confirmLoading && spinner}
          <span>{mergedMessages[state].actionText}</span>
        </Button>
      </div>
    );
  }

  // Remove header/title from Modal, move icon and title into body
  return (
    <Modal
      isOpen={show}
      onClose={confirmLoading ? () => {} : onClose}
      title={null}
      actions={null}
    >
      <div className="flex flex-col items-center text-center px-2 py-2">
        {/* Icon and Title together, centered */}
        <div className="flex flex-col items-center w-full mb-2">
          {(state === "pending" || state === "success" || state === "error") && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 dark:bg-dark-600 p-4 mb-3">
              <Icon className={clsx("size-10", mergedMessages[state].iconClassName)} />
            </span>
          )}
          <span className="font-semibold text-lg text-gray-900 dark:text-dark-100 tracking-tight mb-1">{mergedMessages[state].title}</span>
        </div>
        {mergedMessages[state].description && (
          <p className="mx-auto mt-2 mb-6 max-w-xs text-base text-gray-700 dark:text-dark-200">
            {mergedMessages[state].description}
          </p>
        )}
        <div className="w-full border-t border-gray-200 dark:border-dark-500 my-4" />
        {actions}
      </div>
    </Modal>
  );
}

function Confirm({
  onOk,
  state,
  messages,
  confirmLoading,
  onClose,
  focusRef,
}: ConfirmProps & { focusRef: React.RefObject<HTMLButtonElement | null> }) {
  const { t } = useTranslation();
  
  // Fallback translations for when translation system is not available
  const fallbackTranslations = {
    'common.are_you_sure': 'Are you sure?',
    'common.confirm_delete_default': 'Are you sure you want to delete this record? Once deleted, it cannot be restored.',
    'common.delete': 'Delete',
    'common.deleted': 'Deleted',
    'common.delete_success_default': 'You have successfully deleted the record from the database.',
    'common.done': 'Done',
    'common.error_occurred': 'Oops... Something failed.',
    'common.error_description': 'Ensure internet is on and retry. Contact support if issue remains.',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
  };

  const safeT = (key: string) => {
    const translation = t(key);
    // If translation returns the key itself (meaning no translation found), use fallback
    return translation === key ? (fallbackTranslations[key] || key) : translation;
  };
  
  const defaultMessages: Messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      iconClassName: "text-warning",
      title: safeT('common.are_you_sure'),
      description: safeT('common.confirm_delete_default'),
      actionText: safeT('common.delete'),
    },
    success: {
      Icon: AnimatedTick,
      iconClassName: "text-success",
      title: safeT('common.deleted'),
      description: safeT('common.delete_success_default'),
      actionText: safeT('common.done'),
    },
    error: {
      Icon: XCircleIcon,
      title: safeT('common.error_occurred'),
      description: safeT('common.error_description'),
      actionText: safeT('common.retry'),
      iconClassName: "text-error",
    },
  };

  const mergedMessages = merge(defaultMessages, messages);
  const Icon = mergedMessages[state].Icon;
  const spinner = <GhostSpinner variant="soft" className="size-4 border-2" />;

  return (
    <>
      <Icon
        className={clsx(
          "mx-auto size-24 shrink-0",
          mergedMessages[state].iconClassName,
        )}
      />
      <div className="mt-4">
        <h3 className="text-xl text-gray-800 dark:text-dark-100">
          {mergedMessages[state].title}
        </h3>
        <p className="mx-auto mt-2 max-w-xs">
          {mergedMessages[state].description}
        </p>

        {state === "success" ? (
          <Button
            onClick={onClose}
            color="success"
            className="mt-12 h-9 min-w-[7rem]"
          >
            {mergedMessages[state].actionText}
          </Button>
        ) : (
          <div className="mt-12 flex justify-center space-x-3 rtl:space-x-reverse">
            <Button
              onClick={onClose}
              variant="outlined"
              className="h-9 min-w-[7rem]"
            >
              {safeT('common.cancel')}
            </Button>

            {state === "pending" && (
              <Button
                ref={focusRef}
                onClick={onOk}
                color="primary"
                className="h-9 min-w-[7rem] space-x-2 rtl:space-x-reverse"
              >
                {confirmLoading && spinner}
                <span> {mergedMessages[state].actionText}</span>
              </Button>
            )}

            {state === "error" && (
              <Button
                onClick={onOk}
                color="error"
                className="h-9 min-w-[7rem] space-x-2 rtl:space-x-reverse"
              >
                {confirmLoading && spinner}
                <span> {mergedMessages[state].actionText}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}