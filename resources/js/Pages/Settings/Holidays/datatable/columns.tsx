import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  DateRangeCell,
  DaysCountCell,
  ReasonCell,
  StatusCell,
  ActionsCell,
} from "./cells";
import { Holiday } from "./types";

interface ColumnsProps {
  onDeleteRow?: (row: any) => void;
  t: (key: string) => string;
}

export const createColumns = ({ onDeleteRow, t }: ColumnsProps): ColumnDef<Holiday>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableHiding: false,
  },
  {
    id: "date_range",
    accessorFn: (row) => `${row.start_date} - ${row.end_date}`,
    header: t('common.date_range') || "Date Range",
    cell: DateRangeCell,
  },
  {
    id: "days_count",
    accessorFn: (row) => {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    },
    header: t('common.duration') || "Duration",
    cell: DaysCountCell,
  },
  {
    id: "reason",
    accessorKey: "reason",
    header: t('common.holiday_reason') || "Reason",
    cell: ReasonCell,
  },
  {
    id: "status",
    accessorFn: (row) => {
      const endDate = new Date(row.end_date);
      return endDate >= new Date() ? 'upcoming' : 'past';
    },
    header: t('common.status') || "Status",
    cell: StatusCell,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        table={table}
        onDeleteRow={onDeleteRow}
      />
    ),
    enableHiding: false,
  },
];

