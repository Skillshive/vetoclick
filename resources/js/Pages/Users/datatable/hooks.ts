import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { router } from "@inertiajs/react";

import type { User, TableSettings } from "./types";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseUsersDatatableProps {
  initialData: {
    data: {
      data: User[];
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: any;
  };
  initialFilters: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
}

export function useUserTable({ initialData, initialFilters }: UseUsersDatatableProps) {
  // Data state
  const [users, setUsers] = useState(initialData || {
    data: { data: [] },
    meta: { current_page: 1, from: 0, last_page: 1, per_page: 10, to: 0, total: 0 },
    links: {},
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(false);

  // Single delete modal state
  const [singleDeleteModalOpen, setSingleDeleteModalOpen] = useState(false);
  const [confirmSingleDeleteLoading, setConfirmSingleDeleteLoading] = useState(false);
  const [singleDeleteSuccess, setSingleDeleteSuccess] = useState(false);
  const [singleDeleteError, setSingleDeleteError] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState<any>(null);

  // Table settings
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableFullScreen: false,
    enableRowDense: true,
  });

  // Filters and search
  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>(["name", "email"]);
  const [globalFilter, setGlobalFilter] = useState(initialFilters.search || "");
  const [sorting, setSorting] = useState<SortingState>(
    (initialFilters.sort_by && (initialFilters.sort_by !== "created_at" || initialFilters.sort_direction !== "desc"))
      ? [{ id: initialFilters.sort_by, desc: initialFilters.sort_direction === "desc" }]
      : [],
  );

  // Persistent state
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-users", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-users", {});

  // Table utilities
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Single delete handlers
  const openSingleDeleteModal = (row: any) => {
    setSelectedRowForDelete(row);
    setSingleDeleteModalOpen(true);
    setSingleDeleteError(false);
    setSingleDeleteSuccess(false);
  };

  const closeSingleDeleteModal = () => {
    setSingleDeleteModalOpen(false);
    setSelectedRowForDelete(null);
  };

  const handleSingleDeleteRow = () => {
    if (!selectedRowForDelete) return;

    setConfirmSingleDeleteLoading(true);

    setTimeout(() => {
      tableMeta.deleteRow?.(selectedRowForDelete);
      setSingleDeleteSuccess(true);
      setConfirmSingleDeleteLoading(false);
    }, 600);
  };

  const tableMeta = {
    deleteRow: (row: any) => {
      skipAutoResetPageIndex();

      setUsers((prev: any) => ({
        ...prev,
        data: {
          ...prev.data,
          data: prev.data.data.filter((u: User) => u.uuid !== row.original.uuid),
        },
      }));

      router.delete(route("users.destroy", row.original.uuid), {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setTimeout(() => {
            router.visit(window.location.href, { preserveScroll: true });
          }, 100);
        },
        onError: () => {
          router.visit(window.location.href, { preserveScroll: true });
          console.error("Failed to delete user");
        },
      });
    },
    deleteRows: async (rows: any[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);

      setUsers((prev: any) => ({
        ...prev,
        data: {
          ...prev.data,
          data: prev.data.data.filter((u: User) => !rowIds.includes(u.uuid)),
        },
      }));

      try {
        await Promise.all(
          rows.map(
            (row) =>
              new Promise((resolve, reject) => {
                router.delete(route("users.destroy", row.original.uuid), {
                  preserveState: true,
                  preserveScroll: true,
                  onSuccess: resolve,
                  onError: reject,
                });
              }),
          ),
        );

        setTimeout(() => {
          router.visit(window.location.href, { preserveScroll: true });
        }, 100);
      } catch (error) {
        console.error("Some deletes failed:", error);
        router.visit(window.location.href, { preserveScroll: true });
      }
    },
    setTableSettings,
    setToolbarFilters,
  };

  return {
    // Data
    users,
    setUsers,

    // Modal
    isModalOpen,
    setIsModalOpen,
    selectedUser,
    setSelectedUser,

    // Bulk delete modal
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    bulkDeleteSuccess,
    setBulkDeleteSuccess,
    bulkDeleteError,
    setBulkDeleteError,

    // Single delete modal
    singleDeleteModalOpen,
    setSingleDeleteModalOpen,
    confirmSingleDeleteLoading,
    setConfirmSingleDeleteLoading,
    singleDeleteSuccess,
    setSingleDeleteSuccess,
    singleDeleteError,
    setSingleDeleteError,
    selectedRowForDelete,

    // Table state
    tableSettings,
    setTableSettings,
    toolbarFilters,
    setToolbarFilters,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,

    // Persistent state
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,

    // Table utilities
    autoResetPageIndex,
    skipAutoResetPageIndex,
    tableMeta,

    // Single delete handlers
    openSingleDeleteModal,
    closeSingleDeleteModal,
    handleSingleDeleteRow,
  };
}


