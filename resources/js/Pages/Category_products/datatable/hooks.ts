import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { CategoryProduct } from "@/types/CategoryProducts";
import { TableSettings } from "./types";
import { router } from "@inertiajs/react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

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
    enableRowDense: true,
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
      // Make API call to delete the row
      router.delete(route('category-products.destroy', row.original.uuid), {
        onSuccess: () => {
          // Reload current page data from server (SPA behavior)
          router.visit(window.location.href, {
            preserveState: false, // Don't preserve state to get fresh data
            preserveScroll: true  // Keep scroll position
          });
        },
        onError: () => {
          // If delete fails, revert the local state change
          console.error('Failed to delete category product');
        }
      });
    },
    deleteRows: (rows: any[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);

      // For bulk delete, we need to make individual API calls or use a bulk delete endpoint
      // For now, we'll make individual calls and refresh after all are done
      let completed = 0;
      const total = rows.length;

      rows.forEach((row) => {
        router.delete(route('category-products.destroy', row.original.uuid), {
          onSuccess: () => {
            completed++;
            if (completed === total) {
              // All deletes completed, refresh the page data (SPA behavior)
              router.visit(window.location.href, {
                preserveState: false, // Get fresh data from server
                preserveScroll: true
              });
            }
          },
          onError: () => {
            console.error('Failed to delete category product:', row.original.uuid);
            completed++;
            if (completed === total) {
              // Even if some fail, refresh to get current state (SPA behavior)
              router.visit(window.location.href, {
                preserveState: false, // Get fresh data from server
                preserveScroll: true
              });
            }
          }
        });
      });
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
