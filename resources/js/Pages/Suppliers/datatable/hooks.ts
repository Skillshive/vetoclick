import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Supplier, TableSettings } from "./types";
import { router } from "@inertiajs/react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseSupplierDatatableProps {
  initialData: {
    data: {
      data: Supplier[];
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: any;
  };
  initialFilters: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
}

export function useSupplierTable({ initialData, initialFilters }: UseSupplierDatatableProps) {
  // Data state
  const [suppliers, setSupplier] = useState<{
    data: {
      data: Supplier[];
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: any;
  }>(initialData || {
    data: { data: [] },
    meta: { current_page: 1, from: 0, last_page: 1, per_page: 10, to: 0, total: 0 },
    links: {}
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(false);

  // Single delete modal state
  const [singleDeleteModalOpen, setSingleDeleteModalOpen] = useState(false);
  const [confirmSingleDeleteLoading, setConfirmSingleDeleteLoading] = useState(false);
  const [singleDeleteSuccess, setSingleDeleteSuccess] = useState(false);
  const [singleDeleteError, setSingleDeleteError] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<any>(null);

  // Table settings
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableFullScreen: false,
    enableRowDense: true,
  });

  // Filters and search
  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>(["name", "desp"]);
  const [globalFilter, setGlobalFilter] = useState(initialFilters.search || "");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Persistent state
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-suppliers",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-suppliers",
    {},
  );

  // Table utilities
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Single delete handlers
  const openSingleDeleteModal = (row: any) => {
    setSelectedRowForDelete(row);
    setSingleDeleteModalOpen(true);
    setSingleDeleteError(false);
    setSingleDeleteSuccess(false);
  };

  const closeSingleDeleteModal = () => {
    setSingleDeleteModalOpen(false);
    setSelectedRowForDelete(null);
  };

  const handleSingleDeleteRow = () => {
    if (!selectedRowForDelete) return;

    setConfirmSingleDeleteLoading(true);

    setTimeout(() => {
      tableMeta.deleteRow?.(selectedRowForDelete);
      setSingleDeleteSuccess(true);
      setConfirmSingleDeleteLoading(false);
    }, 1000);
  };

  const tableMeta = {
    deleteRow: (row: any) => {
      skipAutoResetPageIndex();
      setSupplier(prevCats => ({
        ...prevCats,
        data: {
          ...prevCats.data,
          data: prevCats.data.data.filter((product: Supplier) => product.uuid !== row.original.uuid)
        }
      }));

      router.delete(route('suppliers.destroy', row.original.uuid), {
        preserveState: true, 
        preserveScroll: true,
        onSuccess: () => {
          setTimeout(() => {
            router.visit(window.location.href, { preserveScroll: true });
          }, 100);
        },
        onError: () => {
          router.visit(window.location.href, { preserveScroll: true });
          console.error('Failed to delete category blog');
        }
      });
    },
    deleteRows: async (rows: any[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);

      setSupplier(prevCats => ({
        ...prevCats,
        data: {
          ...prevCats.data,
          data: prevCats.data.data.filter((product: Supplier) => !rowIds.includes(product.uuid))
        }
      }));

      try {
        await Promise.all(rows.map(row =>
          new Promise((resolve, reject) => {
            router.delete(route('suppliers.destroy', row.original.uuid), {
              preserveState: true,
              preserveScroll: true,
              onSuccess: resolve,
              onError: reject
            });
          })
        ));

        setTimeout(() => {
          router.visit(window.location.href, { preserveScroll: true });
        }, 100);

      } catch (error) {
        console.error('Some deletes failed:', error);
        router.visit(window.location.href, { preserveScroll: true });
      }
    },
    setTableSettings,
    setToolbarFilters,
  };

  return {
    // Data
    suppliers,
    setSupplier,
    
    // Modal
    isModalOpen,
    setIsModalOpen,
    selectedSupplier,
    setSelectedSupplier,
    
    // Bulk delete modal
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    bulkDeleteSuccess,
    setBulkDeleteSuccess,
    bulkDeleteError,
    setBulkDeleteError,

    // Single delete modal
    singleDeleteModalOpen,
    setSingleDeleteModalOpen,
    confirmSingleDeleteLoading,
    setConfirmSingleDeleteLoading,
    singleDeleteSuccess,
    setSingleDeleteSuccess,
    singleDeleteError,
    setSingleDeleteError,
    selectedRowForDelete,

    // Table state
    tableSettings,
    setTableSettings,
    toolbarFilters,
    setToolbarFilters,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    
    // Persistent state
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    
    // Table utilities
    autoResetPageIndex,
    skipAutoResetPageIndex,
    tableMeta,

    // Single delete handlers
    openSingleDeleteModal,
    closeSingleDeleteModal,
    handleSingleDeleteRow,
  };
}
