import {
  EnvelopeIcon,
  PencilSquareIcon,
  PhoneArrowDownLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HiShieldCheck } from "react-icons/hi";

import { Avatar, Badge, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { getImageUrl } from "@/utils/imageHelper";

import type { User } from "./types";

interface CellProps {
  getValue?: () => any;
  row: { original: User };
}

interface ActionsCellProps {
  row: any;
  table: any;
  setSelectedUser: (user: User | null) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
}

const translateRoleName = (t: (key: string, params?: any) => string, roleName: string) => {
  const translationKey = `role_names.${roleName}`;
  const translated = t(translationKey);
  if (translated === translationKey) {
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
  }
  return translated;
};

export function UserNameCell({ row }: CellProps) {
  const user = row.original;
  return (
    <div className="flex items-center gap-3">
      <Avatar
        size={10}
        src={
          user.image
            ? getImageUrl(user.image, "/assets/default/person-placeholder.jpg")
            : "/assets/default/person-placeholder.jpg"
        }
        name={user.name}
        initialColor="auto"
      />
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-800 dark:text-dark-100">
          {user.name}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-dark-300">{user.email}</p>
      </div>
    </div>
  );
}

export function EmailCell({ getValue }: CellProps) {
  const email = getValue?.();
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-200">
      <EnvelopeIcon className="size-4 text-primary-500" />
      <span className="truncate">{email}</span>
    </div>
  );
}

export function PhoneCell({ getValue }: CellProps) {
  const { t } = useTranslation();
  const phone = getValue?.();
  if (!phone) return   <Badge color="neutral">{t('common.no_data')}</Badge>;
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-200">
      <PhoneArrowDownLeftIcon className="size-4 text-primary-500" />
      <span className="truncate">{phone}</span>
    </div>
  );
}

export function RoleCell({ row }: CellProps) {
  const { t } = useTranslation();
  const roleName = row.original.roles?.[0]?.name;
  if (!roleName) return <Badge color="neutral">{t('common.no_data')}</Badge>;

  return (
    <div className="flex items-center gap-2">
      <HiShieldCheck className="size-4 text-primary-500" />
      <Badge color="primary" variant="soft" className="text-xs">
        {translateRoleName(t, roleName)}
      </Badge>
    </div>
  );
}

export function CreatedAtCell({ getValue }: CellProps) {
  const { t } = useTranslation();
  const createdAt = getValue?.();
  if (!createdAt) return <Badge color="neutral">{t('common.no_data')}</Badge>;
  const d = new Date(createdAt);
  return (
    <span className="text-sm text-gray-700 dark:text-dark-200">
      {Number.isNaN(d.getTime()) ? createdAt : d.toLocaleDateString()}
    </span>
  );
}

export function ActionsCell({
  row,
  table,
  setSelectedUser,
  setIsModalOpen,
  onDeleteRow,
}: ActionsCellProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="flat"
        color="info"
        isIcon
        className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
        title={t("common.edit")}
        onClick={() => {
          setSelectedUser(row.original);
          setIsModalOpen(true);
        }}
      >
        <PencilSquareIcon className="size-4 stroke-1.5" />
      </Button>

      <Button
        type="button"
        variant="flat"
        color="error"
        isIcon
        className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
        title={t("common.delete")}
        onClick={() => onDeleteRow?.(row)}
      >
        <TrashIcon className="size-4 stroke-1.5" />
      </Button>
    </div>
  );
}


