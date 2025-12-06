import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientTable } from './datatable/hooks';
import { createColumns } from './datatable/columns';
import { Toolbar } from './datatable/Toolbar';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Client } from './datatable/types';
import ClientFormModal from '@/components/modals/ClientFormModal';
import { ClientsDatatableProps } from './datatable/types';

export default function Index({clients, filters, old, errors}: ClientsDatatableProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const tableRef = useRef<DataTableRef<Client>>(null);
    const [rowSelection, setRowSelection] = useState({});
    const [currentUrl, setCurrentUrl] = useState(window.location.href);

    const {
        clients: tableData,
        isModalOpen,
        setIsModalOpen,
        selectedClient,
        setSelectedClient,
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
    } = useClientTable({
        initialData: clients,
        initialFilters: filters,
    });

    // Create columns
    const columns = createColumns({
      setSelectedClient,
      setIsModalOpen,
      onDeleteRow: openSingleDeleteModal,
      t
    });

    // Pagination
    const pagination = {
        pageIndex: (clients.meta?.current_page || 1) - 1,
        pageSize: filters.per_page || 10,
        total: clients.meta?.total || 0,
        onChange: (pagination: { pageIndex: number; pageSize: number }) => {
            router.visit(route('clients.index', {
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
    const [bulkDeleteCount, setBulkDeleteCount] = useState(0);

    const openBulkModal = () => {
        const selectedRows = tableRef.current?.table.getSelectedRowModel().rows;
        setBulkDeleteCount(selectedRows?.length || 0);
        setBulkDeleteModalOpen(true);
        setBulkDeleteError(false);
        setBulkDeleteSuccess(false);
    };

    const closeBulkModal = () => {
        setBulkDeleteModalOpen(false);
    };

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
                setRowSelection({});

                showToast({
                    type: 'success',
                    message: t('common.clients_deleted_success') || `${deleteCount} clients deleted successfully`,
                });
            }, 1000);
        }
    };

    // Handle bulk delete modal state
    useEffect(() => {
        if (bulkDeleteSuccess) {
            setTimeout(() => {
                setBulkDeleteModalOpen(false);
                setBulkDeleteSuccess(false);
            }, 1500);
        }
    }, [bulkDeleteSuccess]);

    // Handle single delete modal state
    useEffect(() => {
        if (singleDeleteSuccess) {
            setTimeout(() => {
                closeSingleDeleteModal();
                setSingleDeleteSuccess(false);
            }, 1500);
        }
    }, [singleDeleteSuccess]);

    const handleSingleDeleteRowWithToast = () => {
        setConfirmSingleDeleteLoading(true);

        setTimeout(() => {
            tableMeta.deleteRow?.(selectedRowForDelete);
            setConfirmSingleDeleteLoading(false);
            closeSingleDeleteModal();

            showToast({
                type: 'success',
                message: t('common.client_deleted_success') || 'Client deleted successfully',
            });
        }, 1000);
    };

    // Handle URL state
    useEffect(() => {
        if (old?.action === 'create') {
            setIsModalOpen(true);
        }
        if (old?.action === 'edit') {
            const client = clients.data.data.find((c: Client) => c.uuid === old.uuid);
            if (client) {
                setSelectedClient(client);
                setIsModalOpen(true);
            }
        }
    }, [old, clients.data]);

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
                router.visit(route('clients.index', {
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

    return (
        <MainLayout>
            <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
                <div className="transition-content w-full pb-5">
                    <DataTable<Client>
                        ref={tableRef}
                        data={clients.data.data}
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
                                    setSelectedClient={setSelectedClient}
                                    setIsModalOpen={setIsModalOpen}
                                />
                            ),
                        }}
                        columnVisibility={columnVisibility}
                        onColumnVisibilityChange={setColumnVisibility}
                        columnPinning={columnPinning}
                        onColumnPinningChange={setColumnPinning}
                        autoResetPageIndex={autoResetPageIndex}
                        meta={tableMeta}
                    />
                </div>
            </div>

            {/* Client Form Modal */}
            <ClientFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedClient(null);
                }}
                client={selectedClient}
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmModal
                show={bulkDeleteModalOpen}
                onClose={closeBulkModal}
                messages={{
                    pending: {
                        description: t('common.confirm_delete_clients', { count: bulkDeleteCount }) || `Are you sure you want to delete ${bulkDeleteCount} client(s)?`,
                    }
                }}
                onOk={handleBulkDeleteRows}
                confirmLoading={confirmBulkDeleteLoading}
                state="pending"
            />

            {/* Single Delete Confirmation Modal */}
            <ConfirmModal
                show={singleDeleteModalOpen}
                onClose={closeSingleDeleteModal}
                messages={{
                    pending: {
                        description: selectedRowForDelete?.original 
                            ? t('common.confirm_delete_client', { 
                                name: `${selectedRowForDelete.original.first_name} ${selectedRowForDelete.original.last_name}` 
                              }) || `Are you sure you want to delete ${selectedRowForDelete.original.first_name} ${selectedRowForDelete.original.last_name}?`
                            : t('common.confirm_delete') || 'Are you sure you want to delete this client?',
                    }
                }}
                onOk={handleSingleDeleteRowWithToast}
                confirmLoading={confirmSingleDeleteLoading}
                state="pending"
            />
        </MainLayout>
    );
}

