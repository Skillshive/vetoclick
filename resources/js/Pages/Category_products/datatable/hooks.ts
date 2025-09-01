import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage, useDidUpdate } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { CategoryProduct } from "@/types/CategoryProducts";
import { TableSettings } from "./types";

interface UseCategoryProductTableProps {
  initialData: CategoryProduct[];
  initialFilters: {
    search?: string;
  };
}

export function useCategoryProductTable({ initialData, initialFilters }: UseCategoryProductTableProps) {
  // Data state
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>(initialData || []);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryProduct, setSelectedCategoryProduct] = useState<CategoryProduct | null>(null);
  
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
  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>(["name", "description"]);
  const [globalFilter, setGlobalFilter] = useState(initialFilters.search || "");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Persistent state
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-category-products",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-category-products",
    {},
  );

  // Table utilities
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Table meta functions
  const tableMeta = {
    deleteRow: (row: any) => {
      skipAutoResetPageIndex();
      setCategoryProducts((old) =>
        old.filter((oldRow) => oldRow.uuid !== row.original.uuid),
      );
    },
    deleteRows: (rows: any[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);
      setCategoryProducts((old) =>
        old.filter((row) => !rowIds.includes(row.uuid)),
      );
    },
    setTableSettings,
    setToolbarFilters,
  };

  return {
    // Data
    categoryProducts,
    setCategoryProducts,
    
    // Modal
    isModalOpen,
    setIsModalOpen,
    selectedCategoryProduct,
    setSelectedCategoryProduct,
    
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
