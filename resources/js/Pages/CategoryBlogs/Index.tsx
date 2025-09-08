import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { CategoryBlogManagementPageProps, CategoryBlog } from "@/Pages/CategoryBlogs/datatable/types";
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';
import { useCategoryBlogTable } from './datatable/hooks';
import { createColumns } from './datatable/columns';
import { Toolbar } from './datatable/Toolbar';
import CategoryBlogFormModal from '@/components/modals/CategoryBlogFormModal';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function Index({categoryBlogs, parentCategories, filters, old, errors}: CategoryBlogManagementPageProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const tableRef = useRef<DataTableRef<CategoryBlog>>(null);
    const [rowSelection, setRowSelection] = useState({});

    // Use the custom hook for table state
    const {
        categoryBlogs: tableData,
        isModalOpen,
        setIsModalOpen,
        selectedCategoryBlog,
        setSelectedCategoryBlog,
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
    } = useCategoryBlogTable({
        initialData: categoryBlogs,
        initialFilters: filters,
    });

    // Create columns
    const columns = createColumns({
      setSelectedCategoryBlog,
      setIsModalOpen,
      onDeleteRow: openSingleDeleteModal,
      t
    });

    // Search function that sends backend requests
    const handleSearch = (searchValue: string) => {
        router.visit(route('category-blogs.index', {
            page: 1, // Reset to first page when searching
            per_page: filters.per_page || 10,
            search: searchValue,
            sort_by: sorting[0]?.id || 'created_at',
            sort_direction: sorting[0]?.desc ? 'desc' : 'asc',
        }), {
            preserveScroll: false,
            preserveState: false,
            replace: true
        });
    };

    // Pagination
    const pagination = {
        pageIndex: (categoryBlogs.meta?.current_page || 1) - 1,
        pageSize: filters.per_page || 10,
        total: categoryBlogs.meta?.total || 0,
        onChange: (pagination: { pageIndex: number; pageSize: number }) => {
            router.visit(route('category-blogs.index', {
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
        console.log('Selected rows for bulk delete:', selectedRows);
        console.log('Table ref:', tableRef.current);

        if (selectedRows && selectedRows.length > 0) {
            const deleteCount = selectedRows.length;
            setBulkDeleteCount(deleteCount);
            console.log(`Bulk deleting ${deleteCount} rows`);

            setTimeout(() => {
                tableMeta.deleteRows?.(selectedRows);
                setBulkDeleteSuccess(true);
                setConfirmBulkDeleteLoading(false);
                // Show success toast
                showToast({
                    type: 'success',
                    message: t('common.category_blogs_deleted_success', { count: deleteCount }),
                });
                // Reset success state after showing message
                setTimeout(() => {
                    setBulkDeleteSuccess(false);
                    setBulkDeleteCount(0);
                }, 3000);
            }, 1000);
        } else {
            console.log('No rows selected for bulk delete');
            setConfirmBulkDeleteLoading(false);
        }
    };

    useEffect(() => {
        if (old?.action === 'create') {
            setIsModalOpen(true);
        }
        if (old?.action === 'edit') {
            const category = categoryBlogs.data.data.find((cat: CategoryBlog) => cat.uuid === old.uuid);
            if (category) {
                setSelectedCategoryBlog(category);
                setIsModalOpen(true);
            }
        }
    }, [old, categoryBlogs.data]);


    console.log('categoryBlogs',categoryBlogs)
    console.log('parentCategories',parentCategories)
    const bulkDeleteState = bulkDeleteError ? "error" : bulkDeleteSuccess ? "success" : "pending";

    return <MainLayout>
        <Page title={t('common.category_blogs')}>
            <div className="transition-content w-full pb-5">
                <DataTable<CategoryBlog>
                    ref={tableRef}
                    data={categoryBlogs.data.data}
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
                                onSearch={handleSearch}
                                setSelectedCategoryBlog={setSelectedCategoryBlog}
                                setIsModalOpen={setIsModalOpen}
                                parentCategories={parentCategories}
                            />
                        )
                    }}
                />
            </div>
        </Page>

        <CategoryBlogFormModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setSelectedCategoryBlog(null);
            }}
            categoryBlog={selectedCategoryBlog}
            parentCategories={parentCategories}
            errors={errors}
        />

        <ConfirmModal
            show={bulkDeleteModalOpen}
            onClose={closeBulkModal}
            messages={{
                pending: {
                    description: t('common.confirm_delete_category_blogs', { count: bulkDeleteCount }),
                },
                success: {
                    title: t('common.category_blogs_deleted'),
                    description: t('common.category_blogs_deleted_success', { count: bulkDeleteCount }),
                },
            }}
            onOk={handleBulkDeleteRows}
            confirmLoading={confirmBulkDeleteLoading}
            state={bulkDeleteState}
        />

        <ConfirmModal
            show={singleDeleteModalOpen}
            onClose={closeSingleDeleteModal}
            messages={{
                pending: {
                    description: t('common.confirm_delete_category_blog'),
                },
                success: {
                    title: t('common.category_blog_deleted'),
                    description: t('common.category_blog_deleted_success'),
                },
            }}
            onOk={handleSingleDeleteRow}
            confirmLoading={confirmSingleDeleteLoading}
            state={singleDeleteError ? "error" : singleDeleteSuccess ? "success" : "pending"}
        />
    </MainLayout>
}