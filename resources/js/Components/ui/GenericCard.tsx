import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment, ReactNode, CSSProperties } from "react";
import clsx from "clsx";
import { Card, Avatar, Button } from "@/components/ui";

interface GenericCardProps {
  avatarInitial: string;
  avatarColor: string;
  avatarTextColor?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function GenericCard({
  avatarInitial,
  avatarColor,
  avatarTextColor = '#fff',
  title,
  subtitle,
  description,
  onEdit,
  onDelete,
  className,
  style,
}: GenericCardProps) {
  return (
    <Card className={clsx("flex flex-col items-center justify-between lg:flex-row relative", className)} style={style}>
      <div className="flex flex-col items-center p-4 text-center sm:p-5 lg:flex-row lg:space-x-4 lg:text-start">
        <Avatar
          size={12}
          style={{
            backgroundColor: avatarColor,
            color: avatarTextColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarInitial}
        </Avatar>
        <div className="mt-2 lg:mt-0">
          <h4 className="dark:text-dark-100 truncate text-base font-medium text-gray-800">
            {title}
          </h4>
          {description && (
            <div className="text-xs text-gray-500 mb-1">{description}</div>
          )}
          {subtitle && (
            <p className="text-xs-plus text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <ActionMenu onEdit={onEdit} onDelete={onDelete} />
      )}
    </Card>
  );
}

function ActionMenu({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
  if (!onEdit && !onDelete) return null;
  return (
    <Menu
      as="div"
      className="absolute top-0 right-0 m-2 inline-block text-left lg:relative"
    >
      <MenuButton
        as={Button}
        variant="flat"
        className="size-8 shrink-0 rounded-full p-0"
      >
        <EllipsisHorizontalIcon className="size-4.5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems className="dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none">
          {onEdit && (
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                  onClick={onEdit}
                >
                  <span>Modifier</span>
                </button>
              )}
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                  onClick={onDelete}
                >
                  <span className="text-red-600">Supprimer</span>
                </button>
              )}
            </MenuItem>
          )}
        </MenuItems>
      </Transition>
    </Menu>
  );
} 