import { ColumnDef } from "@tanstack/react-table";
import { SelectCell, SelectHeader } from "@/components/shared/table/SelectCheckbox";
import { Order } from "@/types/Orders";
import {
  ReferenceCell,
  SupplierCell,
  StatusCell,
  OrderTypeCell,
  TotalAmountCell,
  DateCell,
  ActionsCell,
  PaymentMethodCell,
} from "./cells";

interface ColumnsProps {
  onEdit: (order: Order) => void;
  t: (key: string) => string;
}

export const createColumns = ({ onEdit, t }: ColumnsProps): ColumnDef<Order>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  },
  {
    id: "reference",
    accessorKey: "reference",
    header: t("common.order_reference"),
    cell: ReferenceCell,
  },
  {
    id: "supplier",
    accessorFn: (row) => row.supplier?.name,
    header: t("common.supplier"),
    cell: SupplierCell,
    enableColumnFilter: true,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const supplierId = row.original.supplier_id?.toString();
      const supplierUuid = row.original.supplier?.uuid;
      return supplierId === filterValue || supplierUuid === filterValue;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: t("common.status"),
    cell: StatusCell,
    enableColumnFilter: true,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const statusValue = row.original.status?.value?.toString();
      const statusLabel = row.original.status?.label;
      return statusValue === filterValue || statusLabel === filterValue;
    },
  },
  {
    id: "order_type",
    accessorKey: "order_type",
    header: t("common.order_type"),
    cell: OrderTypeCell,
    enableColumnFilter: true,
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const typeValue = row.original.order_type?.value?.toString();
      const typeLabel = row.original.order_type?.label;
      return typeValue === filterValue || typeLabel === filterValue;
    },
  },
  {
    id: "payment_method",
    accessorKey: "payment_method",
    header: t("common.payment_method"),
    cell: PaymentMethodCell,
  },
  {
    id: "total_amount",
    accessorKey: "total_amount",
    header: t("common.order_total"),
    cell: TotalAmountCell,
  },
  {
    id: "order_date",
    accessorKey: "order_date",
    header: t("common.order_date"),
    cell: DateCell,
  },
  {
    id: "payment_due_date",
    accessorKey: "payment_due_date",
    header: t("common.payment_due_date"),
    cell: DateCell,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        table={table}
        onEdit={() => onEdit(row.original)}
      />
    ),
  },
];

