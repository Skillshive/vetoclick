import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { OrderPageProps, Order } from "./datatable/types";
import { useTranslation } from '@/hooks/useTranslation';
import { useOrderTable } from './datatable/hooks';
import { Toolbar } from './datatable/Toolbar';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useEffect, useState, useRef, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  PlusIcon, 
  CubeIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  TruckIcon
} from '@heroicons/react/20/solid';
import clsx from 'clsx';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Index({orders, filters, suppliers, statistics, old, errors}: OrderPageProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { props } = usePage();
    const tableRef = useRef<DataTableRef<Order>>(null);
    const [rowSelection, setRowSelection] = useState({});
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(window.location.href);
    const isUpdatingUrl = useRef(false);
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);

    const handleEdit = (order: Order) => {
        router.visit(route('orders.edit', order.uuid));
    };

    const handleDelete = (order: Order) => {
        setSelectedOrder(order);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedOrder) return;

        setConfirmDeleteLoading(true);
        setDeleteError(null);
        setDeleteSuccess(false);

        router.delete(route('orders.destroy', selectedOrder.uuid), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeleteSuccess(true);
                setConfirmDeleteLoading(false);
                showToast({ type: 'success', message: t('common.order_deleted_success') || 'Order deleted successfully' });
                setTimeout(() => {
                    setDeleteModalOpen(false);
                    setDeleteSuccess(false); 
                }, 2000); 
            },
            onError: (errors: any) => {
                setDeleteError(errors.message || t('common.failed_to_delete_order') || 'Failed to delete order');
                setConfirmDeleteLoading(false);
                showToast({ type: 'error', message: t('common.failed_to_delete_order') || 'Failed to delete order' });
            }
        });
    };

    const {
        orders: tableData,
        bulkDeleteModalOpen,
        setBulkDeleteModalOpen,
        confirmBulkDeleteLoading,
        setConfirmBulkDeleteLoading,
        bulkDeleteSuccess,
        setBulkDeleteSuccess,
        bulkDeleteError,
        setBulkDeleteError,

        // Single delete modal state
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
    } = useOrderTable({
        orders,
        filters,
        rowSelection,
        setRowSelection,
        showToast,
        t,
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    // Handle flash messages
    useEffect(() => {
        if (props.flash?.success) {
            showToast({
                type: 'success',
                message: props.flash.success,
                duration: 3000,
            });
        }
        if (props.flash?.error) {
            showToast({
                type: 'error',
                message: props.flash.error,
                duration: 3000,
            });
        }
    }, [props.flash, showToast]);

    // Initialize filters from URL parameters
    useEffect(() => {
        if (!filtersInitialized && filters) {
            setGlobalFilter(filters.search || '');
            setSorting([{
                id: filters.sort_by || 'created_at',
                desc: filters.sort_direction === 'desc'
            }]);
            setFiltersInitialized(true);
        }
    }, [filters, filtersInitialized, setGlobalFilter, setSorting]);

    // Define pagination with proper onChange handler
    const paginationConfig = useMemo(() => ({
        pageIndex: (orders.meta?.current_page || 1) - 1,
        pageSize: filters.per_page || 10,
        total: orders.meta?.total || 0,
        onChange: (newPagination: { pageIndex: number; pageSize: number }) => {
            if (isUpdatingUrl.current) return;
            
            isUpdatingUrl.current = true;
            
            router.visit(route('orders.index', {
                page: newPagination.pageIndex + 1,
                per_page: newPagination.pageSize,
                search: globalFilter || filters.search || '',
                sort_by: sorting[0]?.id || filters.sort_by || 'created_at',
                sort_direction: sorting[0]?.desc ? 'desc' : (filters.sort_direction || 'desc'),
            }), {
                preserveScroll: false,
                preserveState: false,
                replace: true,
                onFinish: () => {
                    isUpdatingUrl.current = false;
                }
            });
        }
    }), [orders.meta?.current_page, orders.meta?.total, filters.per_page, globalFilter, filters.search, sorting, filters.sort_by, filters.sort_direction]);

    // Handle search changes with debouncing
    useEffect(() => {
        if (!filtersInitialized || isUpdatingUrl.current) return;

        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const currentSearch = params.get('search') || '';
            
            if (globalFilter !== currentSearch) {
                isUpdatingUrl.current = true;
                
                if (globalFilter) {
                    params.set('search', globalFilter);
                } else {
                    params.delete('search');
                }
                params.set('page', '1'); 
                
                router.get(`${window.location.pathname}?${params.toString()}`, {
                    preserveState: true,
                    replace: true,
                    onFinish: () => {
                        isUpdatingUrl.current = false;
                    }
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [globalFilter, filtersInitialized]);

    // Handle URL changes (browser back/forward)
    useEffect(() => {
        const handleUrlChange = () => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                setCurrentUrl(newUrl);
            }
        };

        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, [currentUrl]);

    // Handle bulk delete
    const openBulkModal = () => {
        setBulkDeleteModalOpen(true);
    };

    return <MainLayout>
        <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
        <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
        "py-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800">
            {t('common.orders') || 'Orders'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.visit(route('orders.create'))}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="size-5" />
            <span>{t('common.new_order') || 'New Order'}</span>
          </button>
        </div>
      </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {statistics?.totalOrders || 0}
                        </p>
                        <CubeIcon className="text-primary-500 size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.total_orders') || 'Total Orders'}</p>
                </div>
                
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {statistics?.draftOrders || 0}
                        </p>
                        <ClockIcon className="text-warning size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.draft_orders') || 'Draft'}</p>
                </div>

                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {statistics?.confirmedOrders || 0}
                        </p>
                        <CheckCircleIcon className="text-info size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.confirmed_orders') || 'Confirmed'}</p>
                </div>

                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {statistics?.receivedOrders || 0}
                        </p>
                        <TruckIcon className="text-success size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.received_orders') || 'Received'}</p>
                </div>

                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {statistics?.cancelledOrders || 0}
                        </p>
                        <XCircleIcon className="text-error size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.cancelled_orders') || 'Cancelled'}</p>
                </div>

                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {statistics?.totalAmount || '0.00'}
                        </p>
                        <BanknotesIcon className="text-secondary size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.total_amount') || 'Total Amount'}</p>
                </div>
            </div>

            <div className="flex flex-col pt-6">
                <DataTable<Order>
                    ref={tableRef}
                    data={orders.data}
                    columns={columns}
                    pagination={paginationConfig}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={(updaterOrValue) => {
                        if (typeof updaterOrValue === 'function') {
                            setColumnVisibility(updaterOrValue);
                        } else {
                            setColumnVisibility(updaterOrValue);
                        }
                    }}
                    columnPinning={columnPinning}
                    onColumnPinningChange={setColumnPinning}
                    globalFilter={globalFilter}
                    onGlobalFilterChange={setGlobalFilter}
                    tableSettings={tableSettings}
                    enableRowSelection={true}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    bulkActions={{
                        onDelete: openBulkModal,
                        deleteLabel: t('common.delete')
                    }}
                    slots={{
                        toolbar: (table) => (
                            <Toolbar
                                table={table}
                                globalFilter={globalFilter}
                                setGlobalFilter={setGlobalFilter}
                                suppliers={suppliers}
                            />
                        )
                    }}
                    meta={tableMeta}
                />
            </div>
        </div>

        <ConfirmModal
            show={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onOk={handleConfirmDelete}
            state={deleteError ? "error" : deleteSuccess ? "success" : "pending"}
            confirmLoading={confirmDeleteLoading}
            messages={{
                pending: {
                    title: t('common.confirm_delete') || 'Confirm Delete',
                    description: t('common.confirm_delete_order') || 'Are you sure you want to delete this order?',
                    actionText: t('common.delete') || 'Delete',
                },
                error: {
                    title: t('common.error') || 'Error',
                    description: deleteError || t('common.failed_to_delete_order') || 'Failed to delete order',
                    actionText: t('common.close') || 'Close',
                },
                success: {
                    title: t('common.success') || 'Success',
                    description: t('common.order_deleted_success') || 'Order deleted successfully',
                    actionText: t('common.close') || 'Close',
                }
            }}
        />
    </MainLayout>
}

