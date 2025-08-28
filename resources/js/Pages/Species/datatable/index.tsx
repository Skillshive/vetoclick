import React, { useState, useMemo, useCallback, Fragment, useRef } from "react";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import clsx from "clsx";
import {
  Transition,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import { Table, Card, THead, TBody, Th, Tr, Td, Button, Input, Textarea } from "@/components/ui";
import { TableSortIcon } from "@/components/shared/table/TableSortIcon";
import { Page } from "@/components/shared/Page";
import { useLockScrollbar, useDidUpdate, useLocalStorage, useDisclosure, useClipboard } from "@/hooks";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { getUserAgentBrowser } from "@/utils/dom/getUserAgentBrowser";
import { TableSettings } from "@/components/shared/table/TableSettings";
import { Species, SpeciesManagementPageProps } from "@/types/Species";
import { useSpeciesColumns } from "./columns";
import MainLayout from '@/layouts/MainLayout';
import { router, useForm } from "@inertiajs/react";
import BasePagination from "@/components/shared/table/BasePagination";
import { useToast } from "@/components/common/Toast/ToastContext";
import {
  ConfirmModal,
  ModalState,
  ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import ToolBar from "@/components/shared/table/Toolbar";
import SpeciesFormModal from "@/components/modals/SpeciesFormModal";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

const isSafari = getUserAgentBrowser() === "Safari";

export default function SpeciesDatatable({ species, filters }: SpeciesManagementPageProps) {
  const speciesData = useMemo(() => species.data || [], [species.data]);

  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableFullScreen: false,
    enableRowDense: false,
  });

  const {hasPermission} = useRoleBasedMenu();
  const columns = useSpeciesColumns();
  const [rowsPerPage, setRowsPerPage] = useState(filters?.per_page || 10);
  const [sortBy, setSortBy] = useState(filters?.sort_by || "");
  const [sortOrder, setSortOrder] = useState(filters?.sort_direction || "");
  const [isOpen, { open, close }] = useDisclosure(false);
  const saveRef = useRef(null);
  const { showToast } = useToast();
  const [deleteSpecies, setDeleteSpecies] = useState<Species | null>(null);

  const [isDeleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [isEditModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [isShowModalOpen, { open: openShowModal, close: closeShowModal }] = useDisclosure(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  // Initialize form with useForm from Inertia.js
  const [globalFilter, setGlobalFilter] = useState(filters?.search || "");
  const [sorting, setSorting] = useState<SortingState>([
    { id: filters?.sort_by || "created_at", desc: filters?.sort_direction === "desc" }
  ]);
  const { copy } = useClipboard();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage("column-visibility-species", {});
  const [columnPinning, setColumnPinning] = useLocalStorage("column-pinning-species", {});
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const table = useReactTable({
    data: speciesData,
    columns: columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      onEdit: (row) => {
        console.log('Update species:', row.original);
        handleOpenEditModal(row.original)
      },
      onDelete: (row) => {
        console.log('Delete species:', row.original.uuid);
        handleOpenDeleteModal(row.original);
      },
      deleteRows: (rows) => {
        console.log('Delete species:', rows.map(r => r.original.uuid));
      },
      onView: (row) =>{
        handleShowSpeciesModal(row.original);
      },
      copyToClipboard: (text: string) => {
        copy(text);
        showToast({
            type: 'info',
            message:'Copied to clipboard!',
            duration: 2000,
        });

      },
      setTableSettings,
      hasPermission,
    },
    filterFns: { fuzzy: fuzzyFilter },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnFiltersChange: setColumnFilters,
    autoResetPageIndex,
    manualPagination: true,
    manualSorting: false,
    manualFiltering: false,
    pageCount: species.meta?.last_page || 1,
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      router.get(route('species.index'), {
        search: value,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleShowSpeciesModal = (species: Species) => {
    setSelectedSpecies(species);
    openShowModal();
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);

    router.get(route('species.index'), {
      search: globalFilter,
      sort_by: sorting[0]?.id || sortBy,
      sort_direction: sorting[0]?.desc ? 'desc' : 'asc',
      per_page: newRowsPerPage,
    });
  };

  // Handle opening create modal
  const handleOpenCreateDialog = () => {
    openCreateModal();
  };

  // Handle opening edit modal
  const handleOpenEditModal = (species: Species) => {
    setSelectedSpecies(species);
    openEditModal();
  };
  // Handle opening delete confirmation modal
  const handleOpenDeleteModal = (species: Species) => {
    setDeleteSpecies(species);
    openDeleteModal();
  };

  // Handle delete species confirmation
  const handleDeleteSpecies = () => {
    if (!deleteSpecies) return;

    setConfirmLoading(true);

    router.delete(route('species.destroy', deleteSpecies.uuid), {
      onSuccess: () => {
        showToast({
          type: 'success',
          message: 'Espèce supprimée avec succès',
          duration: 3000,
        });
        closeDeleteModal();
        setDeleteSpecies(null);
      },
      onError: () => {
        showToast({
          type: 'error',
          message: 'Erreur lors de la suppression de l\'espèce',
          duration: 3000,
        });
      },
      onFinish: () => {
        setConfirmLoading(false);
      }
    });
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteSpecies(null);
    closeDeleteModal();
  };

  const handlePageChange = useCallback((page: number) => {
    router.get(route('species.index'), { ...filters, page });
  }, [filters]);

  useDidUpdate(() => table.resetRowSelection(), [speciesData]);
  useLockScrollbar(tableSettings.enableFullScreen);

  // Delete confirmation messages
  const messages: ConfirmMessages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Supprimer l'Espèce",
      description: `Êtes-vous sûr de vouloir supprimer l'espèce "${deleteSpecies?.name}" ? Cette action est irréversible.`,
      actionText: 'Supprimer',
    }
  };

  const handleClearSearch = () => {
    router.get(route('species.index'), {});
    setTimeout(() => {
      setGlobalFilter("");
    }, 800);
  }

  // Modal state
  const state: ModalState = 'pending';
console.log('species',species)
  return (
    <MainLayout>
      <Page title="Espèces">
        <div className="transition-content w-full pb-5">
          <div className={clsx("flex h-full px-(--margin-x) w-full flex-col", tableSettings.enableFullScreen && "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3")}>

            {/* Toolbar */}
            <ToolBar
                title="Espèces"
                searchQuery={globalFilter}
                handleSearchChange={handleSearchChange}
                handleClearSearch={handleClearSearch}
                handleOpenCreateDialog={handleOpenCreateDialog}
                hasPermission={hasPermission}
                permission="create-species"
                Fragment={Fragment}
            />

            <div className={clsx("transition-content flex grow flex-col pt-3", tableSettings.enableFullScreen ? "overflow-hidden" : "")}>
              <Card className={clsx("relative flex grow flex-col", tableSettings.enableFullScreen && "overflow-hidden")}>

                <div className="table-wrapper min-w-full grow">
                  <Table hoverable dense={tableSettings.enableRowDense} sticky={tableSettings.enableFullScreen} className="w-full text-left rtl:text-right">
                    <THead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <Th key={header.id} className={clsx("dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg")}>
                              {header.column.getCanSort() ? (
                                <div className="flex cursor-pointer items-center space-x-3 select-none" onClick={header.column.getToggleSortingHandler()}>
                                  <span className="flex-1">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                  </span>
                                  <TableSortIcon sorted={header.column.getIsSorted()} />
                                </div>
                              ) : header.isPlaceholder ? null : (
                                flexRender(header.column.columnDef.header, header.getContext())
                              )}
                            </Th>
                          ))}
                        </Tr>
                      ))}
                    </THead>
                    <TBody>
                      {table.getRowModel().rows.length === 0 ? (
                        <Tr>
                          <Td colSpan={table.getHeaderGroups()[0]?.headers.length || 1} className="relative bg-white dark:bg-dark-900">
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Aucune espèce trouvée
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400">
                                {globalFilter ?
                                  "Aucune espèce ne correspond à votre recherche. Essayez de modifier vos critères de recherche." :
                                  "Il n'y a aucune espèce dans le système pour le moment."
                                }
                              </p>
                            </div>
                          </Td>
                        </Tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <Tr key={row.id} className={clsx("dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200", row.getIsSelected() && !isSafari && "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent")}>
                            {row.getVisibleCells().map((cell) => (
                              <Td key={cell.id} className="relative bg-white dark:bg-dark-900">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </Td>
                            ))}
                          </Tr>
                        ))
                      )}
                    </TBody>
                  </Table>
                </div>

                {/* Selected Rows Actions */}
                {(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
                  <div className="bg-primary-50 dark:bg-primary-900/20 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {table.getSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
                      </span>
                      <Button
                        color="error"
                        disabled={table.getSelectedRowModel().rows.length > 1}
                        onClick={() => {
                          const selectedRows = table.getSelectedRowModel().rows;
                          if (selectedRows.length === 1) {
                            const singleRow = selectedRows[0];
                            table.options.meta?.onDelete?.(singleRow);
                          }
                        }}
                      >
                        Supprimer la sélection
                      </Button>
                    </div>
                  </div>
                )}

                {species.meta && species.links ? (
                  <BasePagination
                    meta={species.meta}
                    links={species.links}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPage={rowsPerPage}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Pagination data not available. Meta: {species.meta ? 'exists' : 'null'}, Links: {species.links ? 'exists' : 'null'}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          show={isDeleteModalOpen}
          onClose={handleCancelDelete}
          messages={messages}
          onOk={handleDeleteSpecies}
          confirmLoading={confirmLoading}
          state={state}
        />

        {/* CRUD Modals */}
        <SpeciesFormModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          species={null}
        />

        <SpeciesFormModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          species={selectedSpecies}
        />
      </Page>
    </MainLayout>
  );
}
