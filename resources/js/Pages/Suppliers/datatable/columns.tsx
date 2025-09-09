import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  SupplierNameCell, 
  EmailCell, 
  PhoneCell,
  AddressCell,
  CreatedAtCell, 
  ActionsCell 
} from "./cells";
import { Supplier } from "./types";

interface ColumnsProps {
  setSelectedSupplier: (categoryBlog: Supplier | null) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
  t: (key: string) => string;
}

export const createColumns = ({ setSelectedSupplier, setIsModalOpen, onDeleteRow, t }: ColumnsProps): ColumnDef<Supplier>[] => [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Supplier Name",
      cell: SupplierNameCell,
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      cell: EmailCell,
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: "Phone",
      cell: PhoneCell,
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Address",
      cell: AddressCell,
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: "Created Date",
      cell: CreatedAtCell,
    },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        table={table}
        setSelectedSupplier={setSelectedSupplier}
        setIsModalOpen={setIsModalOpen}
        onDeleteRow={onDeleteRow}
      />
    ),
  },
];
