import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
  ColumnDef,
  Table as TanstackTable,
  SortingState,
  RowSelectionState,
  Updater,
  TableMeta,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Fragment, useRef, forwardRef, useImperativeHandle } from "react";
import { Transition } from "@headlessui/react";

import { Table, Card, THead, TBody, Th, Tr, Td, Button } from "@/components/ui";
import { TableSortIcon } from "./TableSortIcon";
import { PaginationSection } from "./PaginationSection";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { getUserAgentBrowser } from "@/utils/dom/getUserAgentBrowser";
import { useThemeContext } from "@/contexts/theme/context";
import { TrashIcon, InboxIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";

const isSafari = getUserAgentBrowser() === "Safari";

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
}

export interface TableMetaType extends TableMeta<any> {
  tableSettings?: TableSettings;
  setTableSettings?: (updater: any) => void;
  deleteRow?: (row: any) => void;
  deleteRows?: (rows: any[]) => void;
  setToolbarFilters?: (filters: string[]) => void;
}

export interface DataTableSlots<TData> {
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode;
  header?: (table: TanstackTable<TData>) => React.ReactNode;
  footer?: (table: TanstackTable<TData>) => React.ReactNode;
  empty?: (table: TanstackTable<TData>) => React.ReactNode;
  bulkActions?: (table: TanstackTable<TData>) => React.ReactNode;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  };
  sorting: SortingState;
  onSortingChange: (updaterOrValue: SortingState | Updater<SortingState>) => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (updaterOrValue: Record<string, boolean> | Updater<Record<string, boolean>>) => void;
  columnPinning?: Record<string, boolean>;
  onColumnPinningChange?: (updaterOrValue: Record<string, boolean> | Updater<Record<string, boolean>>) => void;
  globalFilter: string;
  onGlobalFilterChange: (filter: string) => void;
  tableSettings: TableSettings;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updaterOrValue: RowSelectionState | Updater<RowSelectionState>) => void;
  bulkActions?: {
    onDelete?: () => void;
    deleteLabel?: string;
  };
  noDataMessage?: string;
  className?: string;
  slots?: DataTableSlots<TData>;
  // Legacy support
  renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode;
  meta?: TableMetaType;
}

export interface DataTableRef<TData> {
  table: TanstackTable<TData>;
}

function DataTableInner<TData>(
  {
    data,
    columns,
    pagination,
    sorting,
    onSortingChange,
    columnVisibility = {},
    onColumnVisibilityChange,
    columnPinning = {},
    onColumnPinningChange,
    globalFilter,
    onGlobalFilterChange,
    tableSettings,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    bulkActions,
    noDataMessage,
    className,
    slots,
    renderToolbar,
    meta,
  }: DataTableProps<TData>,
  ref: React.Ref<DataTableRef<TData>>
) {
  const { cardSkin } = useThemeContext();
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
      columnVisibility,
      columnPinning,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onGlobalFilterChange: onGlobalFilterChange,
    onSortingChange: onSortingChange,
    onColumnVisibilityChange: onColumnVisibilityChange,
    onColumnPinningChange: onColumnPinningChange,
    onRowSelectionChange: onRowSelectionChange,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(pagination.total / pagination.pageSize),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater(table.getState().pagination);
        pagination.onChange(newPagination);
      }
    },
    meta: {
      ...meta,
      tableSettings,
    } as TableMetaType,
  });

  useImperativeHandle(ref, () => ({ table }), [table]);

  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col",
        tableSettings.enableFullScreen &&
        "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3",
        className
      )}
    >
      {/* Header/Toolbar */}
      {(slots?.toolbar || renderToolbar) && (
        <div className={clsx(
          tableSettings.enableFullScreen ? "px-4 sm:px-5" : ""
        )}>
          {slots?.toolbar ? slots.toolbar(table) : renderToolbar?.(table)}
        </div>
      )}

      {/* Custom Header */}
      {slots?.header && slots.header(table)}

      <div
        className={clsx(
          "transition-content flex grow flex-col pt-3",
          tableSettings.enableFullScreen
            ? "overflow-hidden"
            : "",
        )}
      >
        <Card
          ref={cardRef}
          className={clsx(
            "relative flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden",
          )}
        >
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table
              hoverable
              dense={tableSettings.enableRowDense}
              sticky={tableSettings.enableFullScreen}
              className="w-full text-left rtl:text-right"
            >
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className={clsx(
                          "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer items-center space-x-3 select-none"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </span>
                            <TableSortIcon
                              sorted={header.column.getIsSorted()}
                            />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getCoreRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <Tr
                      key={row.id}
                      className={clsx(
                        "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                        row.getIsSelected() &&
                        !isSafari &&
                        "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td
                          key={cell.id}
                          className={clsx(
                            "relative",
                            cardSkin === "shadow"
                              ? "dark:bg-dark-700"
                              : "dark:bg-dark-900",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : (
                  slots?.empty ? (
                    slots.empty(table)
                  ) : (
                    <Tr>
                      <Td
                        colSpan={table.getVisibleLeafColumns().length}
                        className="text-center py-8"
                      >
                        <InboxIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                          {noDataMessage || t('common.no_data')}
                        </p>
                      </Td>
                    </Tr>
                  )
                )}
              </TBody>
            </Table>
          </div>
          {/* Floating Selected Rows Actions */}
          {enableRowSelection && (bulkActions || slots?.bulkActions) && (
            slots?.bulkActions ? (
              slots.bulkActions(table)
            ) : (
              <Transition
                as={Fragment}
                show={table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()}
                enter="transition-all duration-200"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="transition-all duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <div className="pointer-events-none sticky inset-x-0 bottom-0 z-5 flex items-center justify-end">
                  <div className="w-full max-w-xl px-2 py-4 sm:absolute sm:-translate-y-1/2 sm:px-4">
                    <div className="dark:bg-dark-50 dark:text-dark-900 pointer-events-auto flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 font-medium text-gray-100 sm:px-4 sm:py-3">
                      <p>
                        <span>{table.getSelectedRowModel().rows.length} {t('common.selected')}</span>
                        <span className="max-sm:hidden">
                          {" "}
                          {t('common.from')} {table.getCoreRowModel().rows.length}
                        </span>
                      </p>
                      <div className="flex space-x-1.5">
                        {bulkActions?.onDelete && (
                          <Button
                            onClick={bulkActions.onDelete}
                            className="text-xs-plus w-7 gap-1.5 rounded-full px-3 py-1.5 sm:w-auto sm:rounded-sm"
                            color="error"
                            disabled={table.getSelectedRowModel().rows.length <= 0}
                          >
                            <TrashIcon className="size-4 shrink-0" />
                            <span className="max-sm:hidden">{bulkActions.deleteLabel || t('common.delete')}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            )
          )}
          {/* Footer/Pagination */}
          {table.getCoreRowModel().rows.length > 0 && (
            slots?.footer ? (
              slots.footer(table)
            ) : (
              <div
                className={clsx(
                  "px-4 pb-4 sm:px-5 sm:pt-4",
                  tableSettings.enableFullScreen &&
                  "dark:bg-dark-800 bg-gray-50",
                  !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && "pt-4",
                )}
              >
                <PaginationSection table={table} totalRows={pagination.total} />
              </div>
            )
          )}
        </Card>
      </div>
    </div>
  );
}

// Column visibility and pinning support added
export const DataTable = forwardRef(DataTableInner) as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<DataTableRef<TData>> }
) => React.ReactElement;