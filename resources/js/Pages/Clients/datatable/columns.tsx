import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  ClientNameCell, 
  EmailCell, 
  PhoneCell,
  AddressCell,
  PetsCountCell,
  CreatedAtCell, 
  ActionsCell 
} from "./cells";
import { Client } from "./types";

interface ColumnsProps {
  setSelectedClient: (client: Client | null) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
  t: (key: string) => string;
}

export const createColumns = ({ setSelectedClient, setIsModalOpen, onDeleteRow, t }: ColumnsProps): ColumnDef<Client>[] => [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableHiding: false,
    },
    {
      id: "name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: t('common.client_name') || "Client Name",
      cell: ClientNameCell,
    },
    {
      id: "email",
      accessorKey: "email",
      header: t('common.email') || "Email",
      cell: EmailCell,
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: t('common.phone') || "Phone",
      cell: PhoneCell,
    },
    {
      id: "address",
      accessorKey: "address",
      header: t('common.address') || "Address",
      cell: AddressCell,
    },
    {
      id: "pets_count",
      accessorKey: "pets_count",
      header: t('common.pets') || "Pets",
      cell: PetsCountCell,
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: t('common.created_date') || "Created Date",
      cell: CreatedAtCell,
    },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        table={table}
        setSelectedClient={setSelectedClient}
        setIsModalOpen={setIsModalOpen}
        onDeleteRow={onDeleteRow}
      />
    ),
    enableHiding: false,
  },
];

