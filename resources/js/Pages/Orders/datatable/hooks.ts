import { useState } from "react";
import { SortingState, type Row } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { router } from "@inertiajs/react";
import { Order } from "@/types/Orders";

type RouteParams = Record<string, unknown> | string | number | Array<string | number>;
declare const route: (name: string, params?: RouteParams, absolute?: boolean) => string;

interface UseOrderTableProps {
  initialData: Order[];
  initialFilters: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
}

export function useOrderTable({ initialData, initialFilters }: UseOrderTableProps) {
  const [orders, setOrders] = useState<{ data: Order[] }>({
    data: initialData || [],
  });

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(false);

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: true,
  });

  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>([
    "reference",
    "supplier",
  ]);
  const [globalFilter, setGlobalFilter] = useState(initialFilters.search || "");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-orders",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-orders",
    {},
  );

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const tableMeta = {
    deleteRow: (row: Row<Order>) => {
      skipAutoResetPageIndex();

      setOrders((prev) => ({
        ...prev,
        data: prev.data.filter((order) => order.uuid !== row.original.uuid),
      }));

      router.delete(route("orders.destroy", row.original.uuid), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setTimeout(
            () =>
              router.visit(window.location.href, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
              }),
            100,
          );
        },
        onError: () => {
          setOrders((prev) => ({
            ...prev,
            data: prev.data,
          }));
          router.visit(window.location.href, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
          });
        },
      });
    },
    deleteRows: async (rows: Row<Order>[]) => {
      skipAutoResetPageIndex();
      const uuids = rows.map((row) => row.original.uuid);

      setOrders((prev) => ({
        ...prev,
        data: prev.data.filter((order) => !uuids.includes(order.uuid)),
      }));

      try {
        await Promise.all(
          rows.map(
            (row) =>
              new Promise<void>((resolve, reject) => {
                router.delete(route("orders.destroy", row.original.uuid), {
                  preserveScroll: true,
                  preserveState: true,
                  onSuccess: () => resolve(),
                  onError: () => reject(),
                });
              }),
          ),
        );

        setTimeout(
          () =>
            router.visit(window.location.href, {
              preserveScroll: true,
              preserveState: true,
              replace: true,
            }),
          100,
        );
      } catch (error) {
        console.error("Failed to delete some orders", error);
        router.visit(window.location.href, {
          preserveScroll: true,
          preserveState: true,
          replace: true,
        });
      }
    },
    setTableSettings,
    setToolbarFilters,
  };

  return {
    orders,
    setOrders,
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    bulkDeleteSuccess,
    setBulkDeleteSuccess,
    bulkDeleteError,
    setBulkDeleteError,
    tableSettings,
    setTableSettings,
    toolbarFilters,
    setToolbarFilters,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    autoResetPageIndex,
    skipAutoResetPageIndex,
    tableMeta,
  };
}

