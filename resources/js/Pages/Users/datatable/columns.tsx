import { ColumnDef } from "@tanstack/react-table";
import { SelectCell, SelectHeader } from "@/Components/shared/table/SelectCheckbox";

import { ActionsCell, CreatedAtCell, PhoneCell, RoleCell, UserNameCell } from "./cells";
import type { User } from "./types";

interface ColumnsProps {
  setSelectedUser: (user: User | null) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
  t: (key: string) => string;
}

export const createColumns = ({
  setSelectedUser,
  setIsModalOpen,
  onDeleteRow,
  t,
}: ColumnsProps): ColumnDef<User>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: t("common.name") || "Name",
    cell: UserNameCell,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: t("common.phone") || "Phone",
    cell: PhoneCell,
  },
  {
    id: "role",
    accessorFn: (row) => row.roles?.[0]?.name ?? "",
    header: t("common.role") || "Role",
    cell: RoleCell,
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
        setSelectedUser={setSelectedUser}
        setIsModalOpen={setIsModalOpen}
        onDeleteRow={onDeleteRow}
      />
    ),
    enableHiding: false,
  },
];


