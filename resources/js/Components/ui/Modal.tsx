import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, ReactNode, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Button } from "@/components/ui";
import { useRTL } from "@/hooks/useRTL";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  const closeRef = useRef(null);
  const { isRtl, rtlClasses } = useRTL();
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
        initialFocus={closeRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel 
            className={clsx(
              "dark:bg-dark-700 relative flex w-full max-w-lg origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300",
              isRtl && "rtl"
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {title && (
              <div className={clsx(
                "dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5",
                isRtl && "flex-row-reverse"
              )}>
                <DialogTitle
                  as="h3"
                  className={clsx(
                    "dark:text-dark-100 text-base font-medium text-gray-800",
                    rtlClasses.textStart
                  )}
                >
                  {title}
                </DialogTitle>
                <Button
                  onClick={onClose}
                  variant="flat"
                  isIcon
                  className={clsx(
                    "size-7 rounded-full",
                    isRtl ? "-ml-1.5" : "-mr-1.5"
                  )}
                  ref={closeRef}
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>
            )}
            <div className={clsx(
              "flex flex-col overflow-y-auto px-4 py-4 sm:px-5",
              rtlClasses.textStart
            )}>
              {children}
              {actions && (
                <div className={clsx(
                  "mt-4 flex gap-3",
                  isRtl ? "justify-start flex-row-reverse" : "justify-end",
                  isRtl && "space-x-reverse"
                )}>
                  {actions}
                </div>
              )}
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

export default Modal; 