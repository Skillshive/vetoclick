import { useState } from "react";
import { SortingState, Row } from "@tanstack/react-table";
import { useLocalStorage } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Species, TableSettings } from "./types";
import { router } from "@inertiajs/react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface UseSpeciesTableProps {
  initialData: Species[];
  initialFilters: {
    search?: string;
  };
}

export function useSpeciesTable({ initialData, initialFilters }: UseSpeciesTableProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  
  // Data state
  const [species, setSpecies] = useState<Species[]>(initialData || []);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [confirmBulkDeleteLoading, setConfirmBulkDeleteLoading] = useState(false);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState(false);

  // Table settings
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    enableFullScreen: false,
    enableRowDense: false,
    enableSorting: true,
    enableColumnFilters: false,
  });

  // Filters and search
  const [toolbarFilters, setToolbarFilters] = useState<string[] | undefined>(["name", "description"]);
  const [globalFilter, setGlobalFilter] = useState(initialFilters.search || "");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Persistent state
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-species",
    {},
  );

  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-species",
    {},
  );

  // Table utilities
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Table meta functions
  const tableMeta = {
    deleteRow: (row: Row<Species>) => {
      skipAutoResetPageIndex();

      // Optimistically remove the row from local state
      setSpecies(setSpecies =>
        setSpecies.filter(oldRow => oldRow.uuid !== row.original.uuid)
      );

      // Make API call to delete the row
      router.delete(route('species.destroy', row.original.uuid), {
        preserveState: true, // Keep the optimistic update
        preserveScroll: true,
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.species_deleted_success', { count: 1 }),
          });
          // Force a fresh reload after a short delay to ensure server state is synced
          setTimeout(() => {
            router.visit(window.location.href, { preserveScroll: true, preserveState: false });
          }, 100);
        },
        onError: () => {
          showToast({
            type: 'error',
            message: t('common.error_occurred'),
          });
          // If delete fails, revert the optimistic update
          router.visit(window.location.href, { preserveScroll: true, preserveState: false });
          console.error('Failed to delete species');
        }
      });
    },

    deleteRows: async (rows: Row<Species>[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);

      // Optimistically remove the rows from local state
      setSpecies(prevSpecies =>
        prevSpecies.filter(species => !rowIds.includes(species.uuid))
      );

      try {
        // Use Promise.all to handle all deletes in parallel but wait for all to complete
        await Promise.all(rows.map(row =>
          new Promise((resolve, reject) => {
            router.delete(route('species.destroy', row.original.uuid), {
              preserveState: true,
              preserveScroll: true,
              onSuccess: resolve,
              onError: reject
            });
          })
        ));

        // After all deletes complete successfully, force a fresh reload
        setTimeout(() => {
          router.visit(window.location.href, { preserveScroll: true, preserveState: false });
        }, 100);

      } catch (error) {
        console.error('Some deletes failed:', error);
        // If any delete fails, reload to get the accurate state
        router.visit(window.location.href, { preserveScroll: true, preserveState: false });
      }
    },
    tableSettings,
    setTableSettings,
    setToolbarFilters,
  };

  return {
    // Data
    species,
    setSpecies,

    // Modal
    isModalOpen,
    setIsModalOpen,
    selectedSpecies,
    setSelectedSpecies,

    // Bulk delete modal
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    bulkDeleteSuccess,
    setBulkDeleteSuccess,
    bulkDeleteError,
    setBulkDeleteError,

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
  };
}
