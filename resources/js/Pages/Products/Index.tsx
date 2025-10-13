import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { ProductManagementPageProps, Product } from "./datatable/types";
import { useTranslation } from '@/hooks/useTranslation';
import { useProductTable } from './datatable/hooks';
import { Toolbar } from './datatable/Toolbar';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useEffect, useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui';
import { 
  CheckBadgeIcon, 
  ClockIcon, 
  XCircleIcon, 
  CubeIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { PlusSmallIcon } from '@heroicons/react/24/outline';

export default function Index({products, categories, filters, old, errors}: ProductManagementPageProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { props } = usePage();
    const tableRef = useRef<DataTableRef<Product>>(null);
    const [rowSelection, setRowSelection] = useState({});
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(window.location.href);
    const isUpdatingUrl = useRef(false);
console.log('products',products)
    // Use the custom hook for table state
    const {
        products: tableData,
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
    } = useProductTable({
        products,
        categories,
        filters,
        rowSelection,
        setRowSelection,
        showToast,
        t,
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
            setPagination({
                pageIndex: (filters.page || 1) - 1,
                pageSize: filters.per_page || 10,
                total: products.meta?.total || 0,
                onChange: (newPagination: { pageIndex: number; pageSize: number }) => {
                    if (isUpdatingUrl.current) return;
                    
                    isUpdatingUrl.current = true;
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', (newPagination.pageIndex + 1).toString());
                    params.set('per_page', newPagination.pageSize.toString());
                    router.get(`${window.location.pathname}?${params.toString()}`, {
                        preserveState: true,
                        replace: true,
                        onFinish: () => {
                            isUpdatingUrl.current = false;
                        }
                    });
                }
            });
            setFiltersInitialized(true);
        }
    }, [filters, filtersInitialized, setGlobalFilter, setSorting, setPagination, products.meta?.total]);

    // Handle search changes with debouncing
    useEffect(() => {
        if (!filtersInitialized || isUpdatingUrl.current) return;

        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const currentSearch = params.get('search') || '';
            
            // Only update if the search has actually changed
            if (globalFilter !== currentSearch) {
                isUpdatingUrl.current = true;
                
                if (globalFilter) {
                    params.set('search', globalFilter);
                } else {
                    params.delete('search');
                }
                params.set('page', '1'); // Reset to page 1 on search change
                
                router.get(`${window.location.pathname}?${params.toString()}`, {
                    preserveState: true,
                    replace: true,
                    onFinish: () => {
                        isUpdatingUrl.current = false;
                    }
                });
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [globalFilter, filtersInitialized]);

    // Handle URL changes (browser back/forward)
    useEffect(() => {
        const handleUrlChange = () => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                setCurrentUrl(newUrl);
                // Just update the state, don't navigate again to avoid infinite loop
            }
        };

        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, [currentUrl]);

    // Handle bulk delete
    const openBulkModal = () => {
        setBulkDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        setConfirmBulkDeleteLoading(true);
        setBulkDeleteError(null);
        setBulkDeleteSuccess(false);

        const selectedRows = tableRef.current?.table.getSelectedRowModel().rows || [];
        const productUuids = selectedRows.map(row => row.original.uuid);

        router.post(route('products.bulk-delete'), {
            product_uuids: productUuids,
            onSuccess: () => {
                setBulkDeleteSuccess(true);
                setConfirmBulkDeleteLoading(false);
                setRowSelection({});
                showToast({ type: 'success', message: 'Products deleted successfully' });
                setTimeout(() => {
                    setBulkDeleteModalOpen(false);
                    setBulkDeleteSuccess(false);
                }, 2000);
            },
            onError: (errors: any) => {
                setBulkDeleteError(errors.message || 'Failed to delete products');
                setConfirmBulkDeleteLoading(false);
                showToast({ type: 'error', message: 'Failed to delete products' });
            }
        });
    };

    // Handle single delete
    const handleSingleDelete = () => {
        if (!selectedRowForDelete) return;

        setConfirmSingleDeleteLoading(true);
        setSingleDeleteError(null);
        setSingleDeleteSuccess(false);

        // @ts-ignore
        router.delete(route('products.destroy', selectedRowForDelete.uuid), {
            onSuccess: () => {
                setSingleDeleteSuccess(true);
                setConfirmSingleDeleteLoading(false);
                showToast({ type: 'success', message: 'Product deleted successfully' });
                setTimeout(() => {
                    closeSingleDeleteModal();
                }, 2000);
            },
            onError: (errors: any) => {
                setSingleDeleteError(errors.message || 'Failed to delete product');
                setConfirmSingleDeleteLoading(false);
                showToast({ type: 'error', message: 'Failed to delete product' });
            }
        });
    };

    const handleCreate = () => {
        router.visit(route('products.create'));
      };

    const bulkDeleteState = bulkDeleteError ? "error" : bulkDeleteSuccess ? "success" : "pending";
    const singleDeleteState = singleDeleteError ? "error" : singleDeleteSuccess ? "success" : "pending";

    // Calculate stats from products data
    const totalProducts = products.meta?.total || 0;
    const activeProducts = products.data.filter(product => product.is_active).length;
    const outOfStockProducts = products.data.filter(product => product.availability_status === 2).length;
    const onOrderProducts = products.data.filter(product => product.availability_status === 4).length;
    const medicationProducts = products.data.filter(product => product.type === 1).length;
    const vaccineProducts = products.data.filter(product => product.type === 2).length;

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
            {t('common.products')}
          </h2>
        </div>
        
        <Button
          onClick={handleCreate}
          className="h-8 space-x-1.5 rounded-md px-3 text-xs"
          color="primary"
        >
          <PlusSmallIcon className="size-4" />
        </Button>
      </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {totalProducts}
                        </p>
                        <CubeIcon className="text-primary-500 size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.products')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {activeProducts}
                        </p>
                        <CheckBadgeIcon className="text-success size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.active')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {outOfStockProducts}
                        </p>
                        <XCircleIcon className="text-error size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.product_status_out_of_stock')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {onOrderProducts}
                        </p>
                        <ClockIcon className="text-warning size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.product_status_on_order')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {medicationProducts}
                        </p>
                        <CurrencyDollarIcon className="text-info size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.product_type_medication')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {vaccineProducts}
                        </p>
                        <PlusIcon className="text-secondary size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.product_type_vaccine')}</p>
                </div>
            </div>

            <div className="flex flex-col pt-6">
                <DataTable<Product>
                    ref={tableRef}
                    data={products.data}
                    columns={columns}
                    pagination={pagination}
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
                                categories={categories}
                            />
                        )
                    }}
                    meta={tableMeta}
                />
            </div>
        </div>

        <ConfirmModal
            show={bulkDeleteModalOpen}
            onClose={() => setBulkDeleteModalOpen(false)}
            onOk={handleBulkDelete}
            state={bulkDeleteState}
            confirmLoading={confirmBulkDeleteLoading}
            messages={{
                pending: {
                    title: t('common.confirm_delete'),
                    description: t('common.confirm_bulk_delete_products', { count: tableRef.current?.table.getSelectedRowModel().rows.length || 0 }),
                    actionText: t('common.delete'),
                }
            }}
        />

        <ConfirmModal
            show={singleDeleteModalOpen}
            onClose={closeSingleDeleteModal}
            onOk={handleSingleDelete}
            state={singleDeleteState}
            confirmLoading={confirmSingleDeleteLoading}
            messages={{
                pending: {
                    title: t('common.confirm_delete'),
                    description: t('common.confirm_delete_product'),
                    actionText: t('common.delete'),
                }
            }}
        />
    </MainLayout>
}