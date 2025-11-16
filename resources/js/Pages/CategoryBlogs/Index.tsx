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
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(window.location.href);

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

    const columns = createColumns({
      setSelectedCategoryBlog,
      setIsModalOpen,
      onDeleteRow: openSingleDeleteModal,
      t
    });

    const pagination = {
        pageIndex: (categoryBlogs.meta?.current_page || 1) - 1,
        pageSize: filters.per_page || 10,
        total: categoryBlogs.meta?.total || 0,
        onChange: (pagination: { pageIndex: number; pageSize: number }) => {
            const parentCategoryFilter = tableRef.current?.table.getColumn("parentCategory")?.getFilterValue() as string[] | undefined;
            router.visit(route('category-blogs.index', {
                page: pagination.pageIndex + 1,
                per_page: pagination.pageSize,
                search: globalFilter,
                sort_by: sorting[0]?.id || 'created_at',
                sort_direction: sorting[0]?.desc ? 'desc' : 'asc',
                parent_category: parentCategoryFilter?.length ? parentCategoryFilter : null,
            }), {
                preserveScroll: false,
                preserveState: false,
                replace: true
            });
        }
    };

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
                message: t('common.category_blogs_deleted_success', { count: deleteCount }),
            });
        }, 1000);
        } else {
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

    useEffect(() => {
        setFiltersInitialized(false);

        const initializeFilters = () => {
            const urlParams = new URLSearchParams(window.location.search);

            let parentCategoryParams: string[] = [];

            const standardParams = urlParams.getAll('parent_category');
            if (standardParams.length > 0) {
                parentCategoryParams = standardParams;
            } else {
                const arrayParams: string[] = [];
                let index = 0;
                while (true) {
                    const paramName = `parent_category[${index}]`;
                    const value = urlParams.get(paramName);
                    if (value === null) break;
                    arrayParams.push(value);
                    index++;
                }
                parentCategoryParams = arrayParams;
            }

            if (parentCategoryParams.length > 0 && tableRef.current?.table) {
                const parentCategoryColumn = tableRef.current.table.getColumn("parentCategory");
                if (parentCategoryColumn) {
                    parentCategoryColumn.setFilterValue(parentCategoryParams);
                    setFiltersInitialized(true);
                }
            } else {
                setFiltersInitialized(true);
            }
        };

        const attemptInitialization = (attempts = 0) => {
            if (attempts > 10) return; 

            if (tableRef.current?.table) {
                initializeFilters();
            } else {
                setTimeout(() => attemptInitialization(attempts + 1), 50);
            }
        };

        attemptInitialization();
    }, [currentUrl]); 

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

    const normalizedParentCategories = Array.isArray(parentCategories) ? parentCategories : parentCategories?.data || [];
    const bulkDeleteState = bulkDeleteError ? "error" : bulkDeleteSuccess ? "success" : "pending";

    return <MainLayout>
        <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
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
                                    setSelectedCategoryBlog={setSelectedCategoryBlog}
                                    setIsModalOpen={setIsModalOpen}
                                    parentCategories={normalizedParentCategories}
                                    filters={filters}
                                />
                        )
                    }}
                    meta={tableMeta}
                />
            </div>
        </div>

        <CategoryBlogFormModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setSelectedCategoryBlog(null);
            }}
            categoryBlog={selectedCategoryBlog}
            parentCategories={normalizedParentCategories}
            errors={errors}
        />

        <ConfirmModal
            show={bulkDeleteModalOpen}
            onClose={closeBulkModal}
            messages={{
                pending: {
                    description: t('common.confirm_delete_category_blogs'),
                },
                success: {
                    title: t('common.category_blogs_deleted'),
                    description: t('common.category_blogs_deleted_success'),
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