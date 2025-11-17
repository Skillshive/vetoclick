import { useState } from "react";
import { SortingState, Row } from "@tanstack/react-table";
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
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
}

export function useCategoryProductTable({ initialData, initialFilters }: UseCategoryProductTableProps) {
  // Data state
  const [categoryProducts, setCategoryProducts] = useState<{ data: CategoryProduct[] }>({ data: initialData || [] });

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
    enableSorting: true,
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
    deleteRow: (row: Row<CategoryProduct>) => {
      skipAutoResetPageIndex();
      
      // Optimistically remove the row from local state
      setCategoryProducts(prevProducts => ({
        ...prevProducts,
        data: prevProducts.data.filter(product => product.uuid !== row.original.uuid)
      }));

      // Make API call to delete the row
      router.delete(route('category-products.destroy', row.original.uuid), {
        preserveState: true, // Keep the optimistic update
        preserveScroll: true,
        onSuccess: () => {
          // Force a fresh reload after a short delay to ensure server state is synced
          setTimeout(() => {
            router.visit(window.location.href, { preserveScroll: true, preserveState: false });
          }, 100);
        },
        onError: () => {
          // If delete fails, revert the optimistic update
          router.visit(window.location.href, { preserveScroll: true, preserveState: false });
          console.error('Failed to delete category product');
        }
      });
    },
    deleteRows: async (rows: Row<CategoryProduct>[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);

      // Optimistically remove the rows from local state
      setCategoryProducts(prevProducts => ({
        ...prevProducts,
        data: prevProducts.data.filter(product => !rowIds.includes(product.uuid))
      }));

      try {
        // Use Promise.all to handle all deletes in parallel but wait for all to complete
        await Promise.all(rows.map(row => 
          new Promise((resolve, reject) => {
            router.delete(route('category-products.destroy', row.original.uuid), {
              preserveState: true,
              preserveScroll: true,
              onSuccess: resolve,
              onError: reject
            });
          })
        ));

        // After all deletes complete successfully, force a fresh reload
        setTimeout(() => {
          router.visit(window.location.href, { preserveScroll: true, preserveState: false });
        }, 100);

      } catch (error) {
        console.error('Some deletes failed:', error);
        // If any delete fails, reload to get the accurate state
        router.visit(window.location.href, { preserveScroll: true, preserveState: false });
      }
    },
    tableSettings,
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
