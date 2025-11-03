import { useState, useMemo } from 'react';
import { SortingState } from '@tanstack/react-table';
import { Appointment, AppointmentPageProps } from './types';
import { createColumns } from './columns';
import { router } from '@inertiajs/react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseAppointmentTableProps {
  appointments: AppointmentPageProps['appointments'];
  filters: AppointmentPageProps['filters'];
  rowSelection: any;
  setRowSelection: (selection: any) => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
  t: (key: string) => string;
  onReport: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export function useAppointmentTable({
  appointments,
  filters,
  rowSelection,
  setRowSelection,
  showToast,
  t,
  onReport,
  onCancel,
}: UseAppointmentTableProps) {

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
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<Appointment | null>(null);

  // Table state
  const [globalFilter, setGlobalFilter] = useState(filters.search || '');
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: filters.sort_by || 'created_at',
      desc: filters.sort_direction === 'desc'
    }
  ]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    sku: false,
    brand: false,
    vaccine_info: false,
    created_at: false,
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
    total: appointments.meta?.total || 0,
    onChange: (newPagination: { pageIndex: number; pageSize: number }) => {
    }
  });

  // Table meta
  const tableMeta = useMemo(() => ({
    tableSettings,
    setTableSettings,
    deleteRow: (row: Appointment) => {
      setSelectedRowForDelete(row);
      setSingleDeleteModalOpen(true);
    },
    deleteRows: (rows: Appointment[]) => {
      setBulkDeleteModalOpen(true);
    },
    setToolbarFilters: (filters: string[]) => {
    },
  }), [tableSettings, setTableSettings]);

  // Columns
  const columns = useMemo(() => {
    return createColumns(
      onReport,
      onCancel,
      t
    );
  }, [onReport, onCancel, t]);

  // Single delete modal functions
  const openSingleDeleteModal = (appointment: Appointment) => {
    setSelectedRowForDelete(appointment);
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
    appointments: appointments.data,

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
