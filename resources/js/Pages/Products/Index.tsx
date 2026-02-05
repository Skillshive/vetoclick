import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { Page } from '@/components/shared/Page';
import { ProductManagementPageProps, Product } from "./datatable/types";
import { useTranslation } from '@/hooks/useTranslation';
import { useProductTable } from './datatable/hooks';
import { Toolbar } from './datatable/Toolbar';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { RTLModal } from '@/components/ui/RTLModal';
import { DatePicker } from '@/components/shared/form/Datepicker';
import React, { useEffect, useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button, Card, Badge } from '@/components/ui';
import { 
  CheckBadgeIcon, 
  ClockIcon, 
  XCircleIcon, 
  CubeIcon,
  CurrencyDollarIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { PlusSmallIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PencilIcon } from 'lucide-react';

export default function Index({products, categories, filters, old, errors}: ProductManagementPageProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { props } = usePage();
    const tableRef = useRef<DataTableRef<Product>>(null);
    const [rowSelection, setRowSelection] = useState({});
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(window.location.href);
    const isUpdatingUrl = useRef(false);
    
    // Lots modal state
    const [lotsModalOpen, setLotsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productLots, setProductLots] = useState<any[]>([]);
    const [lotsLoading, setLotsLoading] = useState(false);
    
    // Edit lot state
    const [editingLotId, setEditingLotId] = useState<number | null>(null);
    const [editLotData, setEditLotData] = useState<any>({});
    const [lotValidationError, setLotValidationError] = useState<string>('');
    

    const handleViewLots = async (product: Product) => {
        setSelectedProduct(product);
        setLotsModalOpen(true);
        setLotsLoading(true);
        setProductLots([]);

        try {
            const response = await fetch(route('products.lots', product.uuid));
            const data = await response.json();
            setProductLots(data.lots || []);
        } catch (error) {
            showToast({
                type: 'error',
                message: t('common.failed_to_load_lots') || 'Failed to load lots',
                duration: 3000,
            });
        } finally {
            setLotsLoading(false);
        }
    };

    const handleEditLot = (lot: any) => {
        setEditingLotId(lot.id);
        setEditLotData({
            expiry_date: lot.expiry_date,
            selling_price: lot.selling_price,
            current_quantity: lot.current_quantity,
        });
    };

    const handleCancelEditLot = () => {
        setEditingLotId(null);
        setEditLotData({});
        setLotValidationError('');
    };

    const handleSaveLot = async (lotId: number) => {
        // Find the lot being edited
        const lot = productLots.find((l: any) => l.id === lotId);
        
        // Frontend validation
        if (lot && editLotData.current_quantity > lot.initial_quantity) {
            setLotValidationError(t('common.current_quantity_cannot_exceed_initial') || 'Current quantity cannot exceed initial quantity');
            showToast({
                type: 'error',
                message: t('common.current_quantity_cannot_exceed_initial') || 'Current quantity cannot exceed initial quantity',
                duration: 3000,
            });
            return;
        }

        try {
            const response = await fetch(route('lots.update', lotId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(editLotData),
            });

            const data = await response.json();

            if (response.ok) {
                showToast({
                    type: 'success',
                    message: t('common.lot_updated_successfully') || 'Lot updated successfully',
                    duration: 3000,
                });
                
                // Refresh lots
                if (selectedProduct) {
                    const lotsResponse = await fetch(route('products.lots', selectedProduct.uuid));
                    const lotsData = await lotsResponse.json();
                    setProductLots(lotsData.lots || []);
                }
                
                setEditingLotId(null);
                setEditLotData({});
                setLotValidationError('');
            } else {
                const errorMessage = data.message || data.error || t('common.failed_to_update_lot') || 'Failed to update lot';
                setLotValidationError(errorMessage);
                showToast({
                    type: 'error',
                    message: errorMessage,
                    duration: 3000,
                });
            }
        } catch (error) {
            showToast({
                type: 'error',
                message: t('common.failed_to_update_lot') || 'Failed to update lot',
                duration: 3000,
            });
        }
    };

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
        onViewLots: handleViewLots,
    });

    // Handle flash messages - use ref to prevent duplicate toasts
    const flashHandledRef = React.useRef<string>('');
    useEffect(() => {
        const successKey = props.flash?.success ? `success-${props.flash.success}` : '';
        const errorKey = props.flash?.error ? `error-${props.flash.error}` : '';
        
        if (props.flash?.success && flashHandledRef.current !== successKey) {
            flashHandledRef.current = successKey;
            showToast({
                type: 'success',
                message: props.flash.success,
                duration: 3000,
            });
        }
        if (props.flash?.error && flashHandledRef.current !== errorKey) {
            flashHandledRef.current = errorKey;
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
                params.set('page', '1'); 
                
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
                setBulkDeleteModalOpen(false);
                setRowSelection({});
                showToast({ type: 'success', message: 'Products deleted successfully' });
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
                closeSingleDeleteModal();
                showToast({ type: 'success', message: 'Product deleted successfully' });
            },
            onError: (errors: any) => {
                setSingleDeleteError(errors.message || 'Failed to delete product');
                setConfirmSingleDeleteLoading(false);
                showToast({ type: 'error', message: 'Failed to delete product' });
            }
        });
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

    return (
        <MainLayout>
            <Page 
                title={t("common.metadata_titles.products_index") || "Products"}
                description={t("common.page_descriptions.products_index") || "Manage your product inventory. View stock levels, prices, and product details."}
            >
        <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
        <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
        "py-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800">
            {t('common.products_breadcrumb')}
          </h2>
        </div>
        
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
                    <p className="text-xs-plus mt-1">{t('common.products_breadcrumb')}</p>
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

        {/* Lots Modal */}
        <RTLModal
            isOpen={lotsModalOpen}
            onClose={() => setLotsModalOpen(false)}
            title={
                <div>
                    <div className="text-lg font-semibold">{t('common.product_lots')}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-normal">
                        {selectedProduct?.name}
                    </div>
                </div>
            }
            size="5xl"
        >
            <div className="min-h-[300px]">
                            {lotsLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
                                </div>
                            ) : productLots.length === 0 ? (
                                <div className="text-center py-12">
                                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
                                        {t('common.no_lots_found')}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-dark-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.reference')}
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.status')}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.initial_quantity')}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.current_quantity')}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.selling_price')}
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.expiry_date')}
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {t('common.actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {productLots.map((lot, index) => {
                                                const isEditing = editingLotId === lot.id;
                                                return (
                                                <tr key={lot.id || index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                                                        {lot.reference}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {lot.status === 1 ? (
                                                            <Badge color="success">{t('common.active')}</Badge>
                                                        ) : lot.status === 2 ? (
                                                            <Badge color="error">{t('common.expired')}</Badge>
                                                        ) : (
                                                            <Badge color="warning">{t('common.depleted')}</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {lot.initial_quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {isEditing ? (
                                                            <div className="w-full">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={lot.initial_quantity}
                                                                    value={editLotData.current_quantity}
                                                                    onChange={(e) => {
                                                                        const value = parseInt(e.target.value) || 0;
                                                                        if (value > lot.initial_quantity) {
                                                                            setLotValidationError(t('common.current_quantity_cannot_exceed_initial'));
                                                                        } else {
                                                                            setLotValidationError('');
                                                                        }
                                                                        setEditLotData({...editLotData, current_quantity: value});
                                                                    }}
                                                                    className={clsx(
                                                                        "w-full px-2 py-1 border rounded dark:bg-dark-600 dark:border-gray-600 text-right",
                                                                        lotValidationError && editingLotId === lot.id && "border-error"
                                                                    )}
                                                                />
                                                                {lotValidationError && editingLotId === lot.id && (
                                                                    <p className="text-xs text-error mt-1">{lotValidationError}</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            lot.current_quantity
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editLotData.selling_price}
                                                                onChange={(e) => setEditLotData({...editLotData, selling_price: e.target.value})}
                                                                className="w-full px-2 py-1 border rounded dark:bg-dark-600 dark:border-gray-600 text-right"
                                                            />
                                                        ) : (
                                                            parseFloat(lot.selling_price).toFixed(2)+      t('common.currency')
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                        {isEditing ? (
                                                            <DatePicker
                                                                value={editLotData.expiry_date || ''}
                                                                onChange={(dates: Date[]) => {
                                                                    if (dates && dates.length > 0) {
                                                                        const date = dates[0];
                                                                        const year = date.getFullYear();
                                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(date.getDate()).padStart(2, '0');
                                                                        setEditLotData({...editLotData, expiry_date: `${year}-${month}-${day}`});
                                                                    }
                                                                }}
                                                                options={{
                                                                    dateFormat: 'Y-m-d',
                                                                }}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            lot.expiry_date
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="flex justify-center gap-2">
                                                            {lot.status === 1 && (
                                                                isEditing ? (
                                                                    <>
                                                                        <Button
                                                                            type="button"
                                                                            variant="flat"
                                                                            color="success"
                                                                            className="px-3 py-1 text-sm"
                                                                            onClick={() => handleSaveLot(lot.id)}
                                                                        >
                                                                            {t('common.save')}
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="flat"
                                                                            color="error"
                                                                            className="px-3 py-1 text-sm"
                                                                            onClick={handleCancelEditLot}
                                                                        >
                                                                            {t('common.cancel')}
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <Button
                                                                        type="button"
                                                                        variant="flat"
                                                                        color="info"
                                                                        isIcon
                                                                        className="size-8"
                                                                        onClick={() => handleEditLot(lot)}
                                                                    >
                                                                        <PencilIcon className="size-4 stroke-1.5" />
                                                                    </Button>
                                                                )
                                                            )}
                                                            {lot.status !== 1 && (
                                                                <span className="text-gray-400 text-xs">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
            </div>
        </RTLModal>

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
            </Page>
        </MainLayout>
    );
}