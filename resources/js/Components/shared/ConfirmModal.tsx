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

const defaultMessages: Messages = {
  pending: {
    Icon: ExclamationTriangleIcon,
    iconClassName: "text-warning",
    title: "Are you sure?",
    description:
      "Are you sure you want to delete this record? Once deleted, it cannot be restored.",
    actionText: "Delete",
  },
  success: {
    Icon: AnimatedTick,
    iconClassName: "text-success",
    title: "Record Deleted",
    description: "You have successfully deleted the record from the database.",
    actionText: "Done",
  },
  error: {
    Icon: XCircleIcon,
    title: "Opps... Something failed.",
    description:
      "Ensure internet is on and retry. Contact support if issue remains.",
    actionText: "Retry",
    iconClassName: "text-error",
  },
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

  const mergedMessages = merge(defaultMessages, messages);
  const Icon = mergedMessages[state].Icon;
  const spinner = <GhostSpinner variant="soft" className="size-4 border-2 mr-2" />;

  // Header title and close button
  const title = (
    <div className="flex items-center gap-3">
      {state === "pending" && (
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 dark:bg-dark-600 p-3">
          <Icon className={clsx("size-7", mergedMessages[state].iconClassName)} />
        </span>
      )}
      <span className="font-semibold text-lg text-gray-900 dark:text-dark-100 tracking-tight">{mergedMessages[state].title}</span>
    </div>
  );

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
          Cancel
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
          Cancel
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
              Cancel
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
