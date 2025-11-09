import { Row, RowData } from "@tanstack/react-table";
import { TableSettings } from "@/components/shared/table/TableSettings";
import { Dispatch, SetStateAction } from "react";
import { ItemViewType } from "@/components/shared/table/ItemViewTypeSelect";
declare module "@tanstack/react-table" {
   
  interface TableMeta<TData extends RowData> {
    deleteRow?: (row: Row<TData>) => void;
    deleteRows?: (rows: Row<TData>[]) => void;
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    setTableSettings?: Dispatch<SetStateAction<TableSettings>>;
    setToolbarFilters?: Dispatch<SetStateAction<string[] | undefined>>;
    setViewType?: Dispatch<SetStateAction<ItemViewType>>;
    onEdit?: (row: Row<TData>) => void;
    onDelete?: (row: Row<TData>) => void;
    onView?: (row: Row<TData>) => void;
    onDeleteRows?: (rows: Row<TData>[]) => void;
    hasPermission?: (permission: string) => boolean;
    copyToClipboard?: (text: string) => void;
  }

  interface TableState {
    tableSettings?: TableSettings;
    toolbarFilters?: string[];
    viewType?: ItemViewType;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnDefBase<TData extends RowData, TValue = unknown> {
    isHiddenColumn?: boolean;
    label?: string;
    filterColumn?: string;
    options?: any[];
  }
}
