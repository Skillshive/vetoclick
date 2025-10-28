import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import { useSupplierTable } from './datatable/hooks';
import { createColumns } from './datatable/columns';
import { Toolbar } from './datatable/Toolbar';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Supplier } from '@/types/Suppliers';
import SupplierFormModal from '@/components/modals/SupplierFormModal';
import { SuppliersDatatableProps } from './datatable/types';

export default function Index({suppliers, filters, old, errors}: SuppliersDatatableProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const tableRef = useRef<DataTableRef<Supplier>>(null);
    const [rowSelection, setRowSelection] = useState({});
    const [currentUrl, setCurrentUrl] = useState(window.location.href);

    const {
        suppliers: tableData,
        isModalOpen,
        setIsModalOpen,
        selectedSupplier,
        setSelectedSupplier,
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
        handleSingleDeleteRow,

        tableSettings,
        toolbarFilters,
        globalFilter,
        setGlobalFilter,
        sorting,
        setSorting,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        autoResetPageIndex,
        tableMeta,
    } = useSupplierTable({
        initialData: suppliers,
        initialFilters: filters,
    });

    // Create columns
    const columns = createColumns({
      setSelectedSupplier,
      setIsModalOpen,
      onDeleteRow: openSingleDeleteModal,
      t
    });

    // Pagination
    const pagination = {
        pageIndex: (suppliers.meta?.current_page || 1) - 1,
        pageSize: filters.per_page || 10,
        total: suppliers.meta?.total || 0,
        onChange: (pagination: { pageIndex: number; pageSize: number }) => {
            router.visit(route('suppliers.index', {
                page: pagination.pageIndex + 1,
                per_page: pagination.pageSize,
                search: globalFilter,
                sort_by: sorting[0]?.id || 'created_at',
                sort_direction: sorting[0]?.desc ? 'desc' : 'asc',
            }), {
                preserveScroll: false,
                preserveState: false,
                replace: true
            });
        }
    };

    // Bulk delete handlers
    const closeBulkModal = () => {
        setBulkDeleteModalOpen(false);
    };

    const openBulkModal = () => {
        setBulkDeleteModalOpen(true);
        setBulkDeleteError(false);
        setBulkDeleteSuccess(false);
    };

    const [bulkDeleteCount, setBulkDeleteCount] = useState(0);

    const handleBulkDeleteRows = () => {
        setConfirmBulkDeleteLoading(true);
        const selectedRows = tableRef.current?.table.getSelectedRowModel().rows;
        if (selectedRows && selectedRows.length > 0) {
            const deleteCount = selectedRows.length;
            setBulkDeleteCount(deleteCount);

            setTimeout(() => {
                tableMeta.deleteRows?.(selectedRows);
                setConfirmBulkDeleteLoading(false);
                closeBulkModal();

                showToast({
                    type: 'success',
                    message: t('common.suppliers_deleted_success'),
                });
            }, 1000);
        } else {
            setConfirmBulkDeleteLoading(false);
        }
    };

    const handleSingleDeleteRowWithToast = () => {
        setConfirmSingleDeleteLoading(true);

        setTimeout(() => {
            tableMeta.deleteRow?.(selectedRowForDelete);
            setConfirmSingleDeleteLoading(false);
            closeSingleDeleteModal();

            showToast({
                type: 'success',
                message: t('common.supplier_deleted_success'),
            });
        }, 1000);
    };

    useEffect(() => {
        if (old?.action === 'create') {
            setIsModalOpen(true);
        }
        if (old?.action === 'edit') {
            const category = suppliers.data.data.find((cat: CategoryBlog) => cat.uuid === old.uuid);
            if (category) {
                setSelectedSupplier(category);
                setIsModalOpen(true);
            }
        }
    }, [old, suppliers.data]);

    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentUrl(window.location.href);
        };

        window.addEventListener('popstate', handleLocationChange);

        const intervalId = setInterval(() => {
            if (window.location.href !== currentUrl) {
                setCurrentUrl(window.location.href);
            }
        }, 100);

        return () => {
            window.removeEventListener('popstate', handleLocationChange);
            clearInterval(intervalId);
        };
    }, [currentUrl]);

    // Trigger sort changes
    useEffect(() => {
        if (sorting.length > 0) {
            const currentParams = new URLSearchParams(window.location.search);
            const newSortBy = sorting[0].id;
            const newSortDirection = sorting[0].desc ? 'desc' : 'asc';

            if (
                currentParams.get('sort_by') !== newSortBy ||
                currentParams.get('sort_direction') !== newSortDirection
            ) {
                router.visit(route('suppliers.index', {
                    page: 1,
                    per_page: filters.per_page || 10,
                    search: globalFilter,
                    sort_by: newSortBy,
                    sort_direction: newSortDirection,
                }), {
                    preserveScroll: false,
                    preserveState: false,
                    replace: true
                });
            }
        }
    }, [sorting]);

    return <MainLayout>
                <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
            <div className="transition-content w-full pb-5">
                <DataTable<Supplier>
                    ref={tableRef}
                    data={suppliers.data.data}
                    columns={columns}
                    pagination={pagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
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
                                    sorting={sorting}
                                    setSelectedSupplier={setSelectedSupplier}
                                    setIsModalOpen={setIsModalOpen}
                                />
                        )
                    }}
                    meta={tableMeta}
                />
            </div>
            </div>

         <SupplierFormModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedSupplier(null);
              }}
              supplier={selectedSupplier}
            />

        <ConfirmModal
            show={bulkDeleteModalOpen}
            onClose={closeBulkModal}
            messages={{
                pending: {
                    description: t('common.confirm_delete_supplier', { count: bulkDeleteCount }),
                }
            }}
            onOk={handleBulkDeleteRows}
            confirmLoading={confirmBulkDeleteLoading}
            state="pending"
        />

        <ConfirmModal
            show={singleDeleteModalOpen}
            onClose={closeSingleDeleteModal}
            messages={{
                pending: {
                    description: t('common.confirm_delete_supplier'),
                }
            }}
            onOk={handleSingleDeleteRowWithToast}
            confirmLoading={confirmSingleDeleteLoading}
            state="pending"
        />
    </MainLayout>
}