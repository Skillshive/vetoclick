import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useLocalStorage, useDidUpdate } from "@/hooks";
import { useSkipper } from "@/utils/react-table/useSkipper";
import { Species, TableSettings } from "./types";

interface UseSpeciesTableProps {
  initialData: Species[];
  initialFilters: {
    search?: string;
  };
}

export function useSpeciesTable({ initialData, initialFilters }: UseSpeciesTableProps) {
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
    deleteRow: (row: any) => {
      skipAutoResetPageIndex();
      setSpecies((old) =>
        old.filter((oldRow) => oldRow.uuid !== row.original.uuid),
      );
    },
    deleteRows: (rows: any[]) => {
      skipAutoResetPageIndex();
      const rowIds = rows.map((row) => row.original.uuid);
      setSpecies((old) =>
        old.filter((row) => !rowIds.includes(row.uuid)),
      );
    },
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
