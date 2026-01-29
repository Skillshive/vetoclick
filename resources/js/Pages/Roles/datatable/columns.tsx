import { ColumnDef } from "@tanstack/react-table";
import { SelectHeader } from "@/Components/shared/table/SelectCheckbox";
import { Checkbox } from "@/components/ui";
import { Row } from "@tanstack/react-table";

import { ActionsCell, CreatedAtCell, PermissionsCountCell, RoleNameCell, isRoleProtected } from "./cells";
import type { Role } from "./types";

// Custom SelectCell that disables selection for protected roles
function RoleSelectCell({ row }: { row: Row<Role> }) {
  const isProtected = isRoleProtected(row.original.name);
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        className="size-4.5"
        checked={row.getIsSelected()}
        disabled={isProtected || !row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    </div>
  );
}

interface ColumnsProps {
  setSelectedRole: (role: Role | null) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
  t: (key: string) => string;
}

export const createColumns = ({
  setSelectedRole,
  setIsModalOpen,
  onDeleteRow,
  t,
}: ColumnsProps): ColumnDef<Role>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: RoleSelectCell,
    enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: t("common.role") || "Role",
    cell: RoleNameCell,
  },
  {
    id: "permissions_count",
    accessorKey: "permissions_count",
    header: t("common.permissions_breadcrumb") || "Permissions",
    cell: PermissionsCountCell,
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: t("common.created_at") || "Created At",
    cell: CreatedAtCell,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        table={table}
        setSelectedRole={setSelectedRole}
        setIsModalOpen={setIsModalOpen}
        onDeleteRow={onDeleteRow}
      />
    ),
    enableHiding: false,
  },
];

