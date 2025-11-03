import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { CategoryBlog, TableSettings } from "./types";
import { router } from "@inertiajs/react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseCategoryBlogDatatableProps {
  initialData: {
    data: {
      data: CategoryBlog[];
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

export function useCategoryBlogTable({ initialData, initialFilters }: UseCategoryBlogDatatableProps) {
      const { showToast } = useToast();
    const { t } = useTranslation();

  
  // Data state
  const [categoryBlogs, setCategoryBlogs] = useState<{
    data: {
      data: CategoryBlog[];
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
  const [selectedCategoryBlog, setSelectedCategoryBlog] = useState<CategoryBlog | null>(null);
  
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
    "column-visibility-category-blogs",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-category-blogs",
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
        setConfirmSingleDeleteLoading(false);
        closeSingleDeleteModal(); 
        
        showToast({
            type: 'success',
            message: t('common.category_blog_deleted_success'),
        });
    }, 1000);
};

  // Table meta functions
  const tableMeta = {
    deleteRow: (row: any) => {
      skipAutoResetPageIndex();
      console.log('Deleting row:', row);
      // Optimistically remove the row from local state
      setCategoryBlogs(prevCats => ({
        ...prevCats,
        data: {
          ...prevCats.data,
          data: prevCats.data.data.filter((product: CategoryBlog) => product.uuid !== row.original.uuid)
        }
      }));

      // Make API call to delete the row
      router.delete(route('category-blogs.destroy', row.original.uuid), {
        preserveState: true, // Keep the optimistic update
        preserveScroll: true,
        onSuccess: () => {
          // Force a fresh reload after a short delay to ensure server state is synced
          setTimeout(() => {
            router.visit(window.location.href, { preserveScroll: true });
          }, 100);
        },
        onError: () => {
          // If delete fails, revert the optimistic update
          router.visit(window.location.href, { preserveScroll: true });
          console.error('Failed to delete category blog');
        }
      });
    },
    deleteRows: async (rows: any[]) => {
      skipAutoResetPageIndex();
      console.log('Bulk deleting rows:', rows);
      const rowIds = rows.map((row) => row.original.uuid);
      console.log('Row IDs to delete:', rowIds);

      // Optimistically remove the rows from local state
      setCategoryBlogs(prevCats => ({
        ...prevCats,
        data: {
          ...prevCats.data,
          data: prevCats.data.data.filter((product: CategoryBlog) => !rowIds.includes(product.uuid))
        }
      }));

      try {
        // Use Promise.all to handle all deletes in parallel but wait for all to complete
        await Promise.all(rows.map(row =>
          new Promise((resolve, reject) => {
            router.delete(route('category-blogs.destroy', row.original.uuid), {
              preserveState: true,
              preserveScroll: true,
              onSuccess: resolve,
              onError: reject
            });
          })
        ));

        // After all deletes complete successfully, force a fresh reload
        setTimeout(() => {
          router.visit(window.location.href, { preserveScroll: true });
        }, 100);

      } catch (error) {
        console.error('Some deletes failed:', error);
        // If any delete fails, reload to get the accurate state
        router.visit(window.location.href, { preserveScroll: true });
      }
    },
    setTableSettings,
    setToolbarFilters,
  };

  return {
    // Data
    categoryBlogs,
    setCategoryBlogs,
    
    // Modal
    isModalOpen,
    setIsModalOpen,
    selectedCategoryBlog,
    setSelectedCategoryBlog,
    
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
