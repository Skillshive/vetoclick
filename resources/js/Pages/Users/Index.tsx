import { useEffect, useRef, useState } from "react";
import MainLayout from "@/Layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { DataTable, DataTableRef } from "@/Components/shared/table/DataTable";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import UserFormModal from "@/Components/modals/UserFormModal";
import { router } from "@inertiajs/react";

import { useUserTable } from "./datatable/hooks";
import { createColumns } from "./datatable/columns";
import { Toolbar } from "./datatable/Toolbar";
import type { User, UsersDatatableProps } from "./datatable/types";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Index({
  users,
  roles = [],
  veterinarians = [],
  filters,
  old,
  errors,
}: UsersDatatableProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const tableRef = useRef<DataTableRef<User>>(null);
  const [rowSelection, setRowSelection] = useState({});

  const {
    users: tableData,
    isModalOpen,
    setIsModalOpen,
    selectedUser,
    setSelectedUser,

    // Single delete modal
    singleDeleteModalOpen,
    confirmSingleDeleteLoading,
    singleDeleteSuccess,
    setSingleDeleteSuccess,
    selectedRowForDelete,
    openSingleDeleteModal,
    closeSingleDeleteModal,

    // Bulk delete modal
    bulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    setBulkDeleteModalOpen,

    tableSettings,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    tableMeta,
  } = useUserTable({
    initialData: users as any,
    initialFilters: filters,
  });

  const columns = createColumns({
    setSelectedUser,
    setIsModalOpen,
    onDeleteRow: openSingleDeleteModal,
    t,
  });

  const pagination = {
    pageIndex: (users.meta?.current_page || 1) - 1,
    pageSize: filters.per_page || 12,
    total: users.meta?.total || 0,
    onChange: ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
      const sortBy = sorting.length > 0 ? sorting[0].id : "created_at";
      const sortDirection = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc";
      const search = globalFilter?.trim() ? globalFilter : undefined;

      router.visit(
        route("users.index", {
          page: pageIndex + 1,
          per_page: pageSize,
          search,
          sort_by: sortBy,
          sort_direction: sortDirection,
        }),
        {
          preserveScroll: true,
          preserveState: false,
          replace: true,
        },
      );
    },
  };

  const handleSingleDeleteRowWithToast = () => {
    tableMeta.deleteRow?.(selectedRowForDelete);
    setTimeout(() => {
      closeSingleDeleteModal();
      showToast({
        type: "success",
        message: t("common.user_deleted_success"),
        duration: 3000,
      });
    }, 350);
  };

  const handleBulkDeleteWithToast = async () => {
    const selectedRows = tableRef.current?.table.getSelectedRowModel().rows || [];
    if (!selectedRows.length) return;

    setConfirmBulkDeleteLoading(true);
    try {
      await tableMeta.deleteRows?.(selectedRows);
      setRowSelection({});
      showToast({
        type: "success",
        message: t("common.users_deleted_success") || `${selectedRows.length} users deleted successfully`,
        duration: 3000,
      });
      setBulkDeleteModalOpen(false);
    } finally {
      setConfirmBulkDeleteLoading(false);
    }
  };

  // Close single delete modal after success "flash"
  useEffect(() => {
    if (singleDeleteSuccess) {
      setTimeout(() => {
        closeSingleDeleteModal();
        setSingleDeleteSuccess(false);
      }, 1200);
    }
  }, [singleDeleteSuccess]);

  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.users_index") || "Users"}
        description={t("common.page_descriptions.users_index") || "Manage system users including veterinarians, receptionists, and administrators."}
      >
      <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
        <div className="transition-content w-full pb-5">
          <DataTable<User>
            ref={tableRef}
            data={tableData?.data?.data || []}
            columns={columns}
            pagination={pagination as any}
            sorting={sorting}
            onSortingChange={setSorting}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            tableSettings={tableSettings}
            enableRowSelection={true}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            bulkActions={{
              onDelete: () => {
                const selectedRows = tableRef.current?.table.getSelectedRowModel().rows;
                if (selectedRows && selectedRows.length > 0) {
                  setBulkDeleteModalOpen(true);
                }
              },
              deleteLabel: t("common.delete"),
            }}
            slots={{
              toolbar: (table) => (
                <Toolbar
                  table={table}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                  sorting={sorting}
                  setSelectedUser={setSelectedUser}
                  setIsModalOpen={setIsModalOpen}
                />
              ),
            }}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            columnPinning={columnPinning}
            onColumnPinningChange={setColumnPinning}
            meta={tableMeta}
          />
        </div>
      </div>

      {/* Single Delete Confirmation Modal */}
      <ConfirmModal
        show={singleDeleteModalOpen}
        onClose={closeSingleDeleteModal}
        messages={{
          pending: {
            description: t("common.confirm_delete_user", {
              name: selectedRowForDelete?.original?.name || "",
            }),
          },
        }}
        onOk={handleSingleDeleteRowWithToast}
        confirmLoading={confirmSingleDeleteLoading}
        state="pending"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        show={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        messages={{
          pending: {
            description:
              t("common.confirm_delete_users") ||
              "Are you sure you want to delete the selected users?",
          },
        }}
        onOk={handleBulkDeleteWithToast}
        confirmLoading={confirmBulkDeleteLoading}
        state="pending"
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser as any}
        roles={roles}
        veterinarians={veterinarians}
      />
      </Page>
    </MainLayout>
  );
}