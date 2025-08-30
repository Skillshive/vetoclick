import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage, useDidUpdate } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Supplier, TableSettings } from "./types";

interface UseSuppliersTableProps {
  initialData: Supplier[];
  initialFilters: {
    search?: string;
  };
}

export function useSuppliersTable({ initialData, initialFilters }: UseSuppliersTableProps) {
  // Data state
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialData || []);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(false);

  // Table settings
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableFullScreen: false,
    enableRowDense: false,
  });

  // Filters and search
  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>(["name", "email", "phone"]);
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

  // Table meta functions
  const tableMeta = {
    deleteRow: (row: any) => {
      skipAutoResetPageIndex();
      setSuppliers((old) =>
        old.filter((oldRow) => oldRow.uuid !== row.original.uuid),
      );
    },
    deleteRows: (rows: any[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);
      setSuppliers((old) =>
        old.filter((row) => !rowIds.includes(row.uuid)),
      );
    },
    setTableSettings,
    setToolbarFilters,
  };

  return {
    // Data
    suppliers,
    setSuppliers,
    
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
  };
}
