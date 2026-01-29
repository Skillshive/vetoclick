import {
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HiShieldCheck } from "react-icons/hi";

import { Badge, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

import type { Role } from "./types";

// Protected roles that cannot be deleted
const PROTECTED_ROLES = ["admin", "veterinarian", "receptionist", "client"];

export const isRoleProtected = (roleName: string): boolean => {
  return PROTECTED_ROLES.includes(roleName.toLowerCase());
};

interface CellProps {
  getValue?: () => any;
  row: { original: Role };
}

interface ActionsCellProps {
  row: any;
  table: any;
  setSelectedRole: (role: Role | null) => void;
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

export function RoleNameCell({ row }: CellProps) {
  const { t } = useTranslation();
  const role = row.original;
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0">
        <HiShieldCheck className="size-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-800 dark:text-dark-100">
          {translateRoleName(t, role.name)}
        </p>
        {role.guard_name && (
          <p className="truncate text-xs text-gray-500 dark:text-dark-300">{role.guard_name}</p>
        )}
      </div>
    </div>
  );
}

export function PermissionsCountCell({ row }: CellProps) {
  const { t } = useTranslation();
  const count = row.original.permissions_count || 0;
  return (
    <Badge color="primary" variant="soft" className="text-xs">
      {count} {t('common.permissions_breadcrumb')}
    </Badge>
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
  setSelectedRole,
  setIsModalOpen,
  onDeleteRow,
}: ActionsCellProps) {
  const { t } = useTranslation();
  const isProtected = isRoleProtected(row.original.name);

  return (
    <div className="flex items-center justify-center gap-2">
      {!isProtected && (
        <Button
          type="button"
          variant="flat"
          color="info"
          isIcon
          className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
          title={t("common.edit")}
          onClick={() => {
            setSelectedRole(row.original);
            setIsModalOpen(true);
          }}
        >
          <PencilSquareIcon className="size-4 stroke-1.5" />
        </Button>
      )}

      {!isProtected && (
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
      )}
    </div>
  );
}

