import { useEffect, useRef, useState } from "react";
import MainLayout from "@/Layouts/MainLayout";
import { DataTable, DataTableRef } from "@/Components/shared/table/DataTable";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import RoleFormModal from "@/Components/modals/RoleFormModal";
import { router } from "@inertiajs/react";

import { useRoleTable } from "./datatable/hooks";
import { createColumns } from "./datatable/columns";
import { Toolbar } from "./datatable/Toolbar";
import { isRoleProtected } from "./datatable/cells";
import type { Role, RolesDatatableProps } from "./datatable/types";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Index({
  roles,
  permissions = [],
  permissionGroups = [],
  filters,
  old,
  errors,
}: RolesDatatableProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const tableRef = useRef<DataTableRef<Role>>(null);
  const [rowSelection, setRowSelection] = useState({});

  const {
    roles: tableData,
    isModalOpen,
    setIsModalOpen,
    selectedRole,
    setSelectedRole,

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
  } = useRoleTable({
    initialData: roles as any,
    initialFilters: filters,
  });

  const columns = createColumns({
    setSelectedRole,
    setIsModalOpen,
    onDeleteRow: openSingleDeleteModal,
    t,
  });

  const pagination = {
    pageIndex: (roles.data.meta?.current_page || 1) - 1,
    pageSize: filters.per_page || 12,
    total: roles.data.meta?.total || 0,
    onChange: ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
      const sortBy = sorting.length > 0 ? sorting[0].id : "created_at";
      const sortDirection = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc";
      const search = globalFilter?.trim() ? globalFilter : undefined;

      router.visit(
        route("roles.index", {
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
    // Safety check: prevent deletion of protected roles
    if (selectedRowForDelete && isRoleProtected(selectedRowForDelete.original.name)) {
      showToast({
        type: "warning",
        message: t("common.cannot_delete_protected_role") || "This role cannot be deleted",
        duration: 3000,
      });
      closeSingleDeleteModal();
      return;
    }

    tableMeta.deleteRow?.(selectedRowForDelete);
    setTimeout(() => {
      closeSingleDeleteModal();
      showToast({
        type: "success",
        message: t("common.role_deleted_success"),
        duration: 3000,
      });
    }, 350);
  };

  const handleBulkDeleteWithToast = async () => {
    const selectedRows = tableRef.current?.table.getSelectedRowModel().rows || [];
    if (!selectedRows.length) return;

    // Filter out protected roles
    const deletableRows = selectedRows.filter(
      (row) => !isRoleProtected(row.original.name)
    );

    if (deletableRows.length === 0) {
      showToast({
        type: "warning",
        message: t("common.cannot_delete_protected_roles") || "Protected roles cannot be deleted",
        duration: 3000,
      });
      setBulkDeleteModalOpen(false);
      return;
    }

    if (deletableRows.length < selectedRows.length) {
      showToast({
        type: "info",
        message: t("common.some_roles_protected") || `${selectedRows.length - deletableRows.length} protected role(s) were skipped`,
        duration: 3000,
      });
    }

    setConfirmBulkDeleteLoading(true);
    try {
      await tableMeta.deleteRows?.(deletableRows);
      setRowSelection({});
      showToast({
        type: "success",
        message: t("common.roles_deleted_success") || `${deletableRows.length} roles deleted successfully`,
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
      <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
        <div className="transition-content w-full pb-5">
          <DataTable<Role>
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
                  setSelectedRole={(role) => {
                    // Safety check: prevent editing protected roles
                    if (role && isRoleProtected(role.name)) {
                      showToast({
                        type: "warning",
                        message: t("common.cannot_edit_protected_role") || "This role cannot be edited",
                        duration: 3000,
                      });
                      return;
                    }
                    setSelectedRole(role);
                  }}
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
            description: t("common.confirm_delete_role", {
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
              t("common.confirm_delete_roles") ||
              "Are you sure you want to delete the selected roles?",
          },
        }}
        onOk={handleBulkDeleteWithToast}
        confirmLoading={confirmBulkDeleteLoading}
        state="pending"
      />

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isModalOpen && (!selectedRole || !isRoleProtected(selectedRole.name))}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole && !isRoleProtected(selectedRole.name) ? (selectedRole as any) : null}
        permissions={permissions}
        permissionGroups={permissionGroups}
      />
    </MainLayout>
  );
}
