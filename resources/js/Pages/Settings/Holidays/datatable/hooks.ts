import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Holiday, TableSettings } from "./types";
import axios from "axios";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseHolidayDatatableProps {
  initialData: Holiday[];
  initialFilters?: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
}

export function useHolidayTable({ initialData, initialFilters }: UseHolidayDatatableProps) {
  // Data state
  const [holidays, setHolidays] = useState<Holiday[]>(initialData || []);

  // Table settings
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableFullScreen: false,
    enableRowDense: true,
  });

  // Filters and search
  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>(["date_range", "reason"]);
  const [globalFilter, setGlobalFilter] = useState(initialFilters?.search || "");
  const [sorting, setSorting] = useState<SortingState>(
    (initialFilters?.sort_by && (initialFilters.sort_by !== 'start_date' || initialFilters.sort_direction !== 'desc')) ?
      [{ id: initialFilters.sort_by, desc: initialFilters.sort_direction === 'desc' }] : []
  );

  // Persistent state
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-holidays",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-holidays",
    {},
  );

  // Table utilities
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Single delete modal state
  const [singleDeleteModalOpen, setSingleDeleteModalOpen] = useState(false);
  const [confirmSingleDeleteLoading, setConfirmSingleDeleteLoading] = useState(false);
  const [singleDeleteSuccess, setSingleDeleteSuccess] = useState(false);
  const [singleDeleteError, setSingleDeleteError] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<any>(null);

  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [selectedRowsForDelete, setSelectedRowsForDelete] = useState<any[]>([]);

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

  // Bulk delete handlers
  const openBulkDeleteModal = (rows: any[]) => {
    setSelectedRowsForDelete(rows);
    setBulkDeleteModalOpen(true);
  };

  const closeBulkDeleteModal = () => {
    setBulkDeleteModalOpen(false);
    setSelectedRowsForDelete([]);
  };

  const tableMeta = {
    deleteRow: async (row: any, onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
      skipAutoResetPageIndex();
      
      // Optimistically update UI
      setHolidays(prevHolidays =>
        prevHolidays.filter((holiday: Holiday) => holiday.uuid !== row.original.uuid)
      );

      try {
        const response = await axios.delete(route('holidays.destroy', row.original.uuid));
        
        if (response.data.success) {
          const message = response.data.message || 'Holiday deleted successfully';
          onSuccess?.(message);
        } else {
          throw new Error(response.data.message || 'Failed to delete holiday');
        }
      } catch (error: any) {
        // Revert optimistic update on error
        setHolidays(prevHolidays => [...prevHolidays, row.original]);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete holiday';
        onError?.(errorMessage);
        console.error('Failed to delete holiday:', error);
      }
    },
    deleteRows: async (rows: any[], onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);
      const rowsToRestore = rows.map(row => row.original);

      // Optimistically update UI
      setHolidays(prevHolidays =>
        prevHolidays.filter((holiday: Holiday) => !rowIds.includes(holiday.uuid))
      );

      try {
        const results = await Promise.all(
          rows.map(row => axios.delete(route('holidays.destroy', row.original.uuid)))
        );

        const allSuccess = results.every(response => response.data.success);
        
        if (allSuccess) {
          const message = `${rows.length} holiday(s) deleted successfully`;
          onSuccess?.(message);
        } else {
          throw new Error('Some deletes failed');
        }
      } catch (error: any) {
        // Revert optimistic update on error
        setHolidays(prevHolidays => [...prevHolidays, ...rowsToRestore]);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete holidays';
        onError?.(errorMessage);
        console.error('Some deletes failed:', error);
      }
    },
    setTableSettings,
    setToolbarFilters,
    setHolidays: (newHolidays: Holiday[]) => {
      setHolidays(newHolidays);
    },
  };

  return {
    // Data
    holidays,
    setHolidays,
    
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
    openSingleDeleteModal,
    closeSingleDeleteModal,
    handleSingleDeleteRow,

    // Bulk delete modal
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    selectedRowsForDelete,
    openBulkDeleteModal,
    closeBulkDeleteModal,
  };
}

