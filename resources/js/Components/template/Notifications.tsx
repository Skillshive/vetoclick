// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArchiveBoxXMarkIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import React from "react";

// Local Imports
import {
  Avatar,
  type AvatarProps,
  AvatarDot,
  Badge,
  Button,
} from "@/components/ui";
import { NotificationType } from "@/@types/common";
import AlarmIcon from "@/assets/dualicons/alarm.svg?react";
import GirlEmptyBox from "@/assets/illustrations/girl-empty-box.svg?react";
import { useThemeContext } from "@/contexts/theme/context";
import { useNotification } from "@/Components/common/Notification/NotificationProvider";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface NotificationTypeInfo {
  title: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: AvatarProps["initialColor"];
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
}

interface NotificationItemProps {
  data: Notification;
  remove: (id: string) => void;
}

const types: Record<NotificationType, NotificationTypeInfo> = {
  message: {
    title: "Message",
    Icon: EnvelopeIcon,
    color: "info",
  },
  task: {
    title: "Task",
    Icon: IoCheckmarkDoneOutline,
    color: "success",
  },
  log: {
    title: "Log",
    Icon: DocumentTextIcon,
    color: "neutral",
  },
  security: {
    title: "Security",
    Icon: ExclamationTriangleIcon,
    color: "error",
  },
};

export function Notifications() {
  const { overlayNotifications, removeOverlayNotification } = useNotification();

  // Convert overlay notifications to the format expected by this component
  const notifications: Notification[] = overlayNotifications.map((notif) => ({
    id: notif.id,
    title: notif.title,
    description: notif.description,
    type: notif.type,
    time: notif.time,
  }));


  const removeNotification = (id: string): void => {
    removeOverlayNotification(id);
  };

  return (
    <Popover className="relative flex">
      <PopoverButton
        as={Button}
        variant="flat"
        isIcon
        className="relative size-9 rounded-full"
      >
        <AlarmIcon className="size-6 text-gray-900 dark:text-dark-100" />
        {notifications.length > 0 && (
          <>
            <AvatarDot
              color="error"
              isPing
              className="top-0 ltr:right-0 rtl:left-0"
            />
            <Badge
              color="error"
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full px-1 text-[0.625rem] font-semibold"
              variant="filled"
            >
              {notifications.length > 99 ? '99+' : notifications.length}
            </Badge>
          </>
        )}
      </PopoverButton>
      <Transition
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <PopoverPanel
          anchor={{ to: "bottom end", gap: 8 }}
          className="z-70 mx-4 flex h-[min(32rem,calc(100vh-6rem))] w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-150 bg-white shadow-soft dark:border-dark-800 dark:bg-dark-700 dark:shadow-soft-dark sm:m-0 sm:w-80"
        >
          <div className="flex grow flex-col overflow-hidden">
              <div className="rounded-t-lg bg-gray-100 dark:bg-dark-800">
                <div className="flex items-center justify-between px-4 p-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800 dark:text-dark-100">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <Badge
                        color="primary"
                        className="h-5 rounded-full px-1.5"
                        variant="soft"
                      >
                        {notifications.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {notifications.length > 0 ? (
                <div className="custom-scrollbar grow space-y-4 overflow-y-auto overflow-x-hidden p-4">
                  {notifications.map((item) => (
                    <NotificationItem
                      key={item.id}
                      remove={removeNotification}
                      data={item}
                    />
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}

function Empty() {
  const { primaryColorScheme: primary, darkColorScheme: dark } =
    useThemeContext();
  const { t } = useTranslation();
  return (
    <div className="grid grow place-items-center text-center">
      <div className="">
        <GirlEmptyBox
          className="mx-auto w-40"
          style={
            {
              "--primary": primary[500],
              "--dark": dark[500],
            } as React.CSSProperties
          }
        />
        <div className="mt-6">
          <p>{t('common.no_notifications_yet') || 'No new notifications yet'}</p>
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ data, remove }: NotificationItemProps) {
  const Icon = types[data.type].Icon;
  return (
    <div className="group flex items-center justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        <Avatar
          size={10}
          initialColor={types[data.type].color}
          classNames={{ display: "rounded-lg" }}
        >
          <Icon className="size-4.5" />
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="-mt-0.5 font-medium text-gray-800 dark:text-dark-100">
            {data.title}
          </p>
          <div className="mt-0.5 text-xs break-words">{data.description}</div>
          <div className="mt-1 text-xs text-gray-400 dark:text-dark-300">
            {data.time}
          </div>
        </div>
      </div>
      <Button
        variant="flat"
        isIcon
        onClick={() => remove(data.id)}
        className="size-7 rounded-full opacity-0 group-hover:opacity-100 ltr:-mr-2 rtl:-ml-2"
      >
        <ArchiveBoxXMarkIcon className="size-4" />
      </Button>
    </div>
  );
}
