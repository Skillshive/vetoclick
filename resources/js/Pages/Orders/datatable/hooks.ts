import { useState, useMemo } from 'react';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { Order, OrderPageProps } from './types';
import { createColumns } from './columns';
import { router } from '@inertiajs/react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseOrderTableProps {
  orders: OrderPageProps['orders'];
  filters: OrderPageProps['filters'];
  rowSelection: any;
  setRowSelection: (selection: any) => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
  t: (key: string) => string;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onView: (order: Order) => void;
}

export function useOrderTable({
  orders,
  filters,
  rowSelection,
  setRowSelection,
  showToast,
  t,
  onEdit,
  onDelete,
  onView,
}: UseOrderTableProps) {

  // Bulk delete state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Single delete state
  const [singleDeleteModalOpen, setSingleDeleteModalOpen] = useState(false);
  const [confirmSingleDeleteLoading, setConfirmSingleDeleteLoading] = useState(false);
  const [singleDeleteSuccess, setSingleDeleteSuccess] = useState(false);
  const [singleDeleteError, setSingleDeleteError] = useState<string | null>(null);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<Order | null>(null);

  // Table state
  const [globalFilter, setGlobalFilter] = useState(filters.search || '');
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: filters.sort_by || 'created_at',
      desc: filters.sort_direction === 'desc'
    }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    payment_due_date: false,
  });
  const [columnPinning, setColumnPinning] = useState({});
  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: true,
  });
  const [pagination, setPagination] = useState({
    pageIndex: (filters.page || 1) - 1,
    pageSize: filters.per_page || 10,
    total: orders.meta?.total || 0,
    onChange: (newPagination: { pageIndex: number; pageSize: number }) => {
      // This will be set in the component
    }
  });

  // Table meta
  const tableMeta = useMemo(() => ({
    tableSettings,
    setTableSettings,
    deleteRow: (row: Order) => {
      setSelectedRowForDelete(row);
      setSingleDeleteModalOpen(true);
    },
    deleteRows: (rows: Order[]) => {
      setBulkDeleteModalOpen(true);
    },
    setToolbarFilters: (filters: string[]) => {
    },
  }), [tableSettings, setTableSettings]);

  // Columns
  const columns = useMemo(() => {
    return createColumns(
      onEdit,
      onDelete,
      onView,
      t
    );
  }, [onEdit, onDelete, onView, t]);

  // Single delete modal functions
  const openSingleDeleteModal = (order: Order) => {
    setSelectedRowForDelete(order);
    setSingleDeleteModalOpen(true);
  };

  const closeSingleDeleteModal = () => {
    setSingleDeleteModalOpen(false);
    setSelectedRowForDelete(null);
    setSingleDeleteError(null);
    setSingleDeleteSuccess(false);
  };

  return {
    // Data
    orders: orders.data,

    // Bulk delete state
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    bulkDeleteSuccess,
    setBulkDeleteSuccess,
    bulkDeleteError,
    setBulkDeleteError,

    // Single delete state
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

    // Table state
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    tableSettings,
    setTableSettings,
    pagination,
    setPagination,
    columns,
    tableMeta,
  };
}

