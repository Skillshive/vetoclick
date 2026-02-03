// Import Dependencies
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';

// Local Imports
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { useHolidayTable } from "./Holidays/datatable/hooks";
import { createColumns } from "./Holidays/datatable/columns";
import { Toolbar } from "./Holidays/datatable/Toolbar";
import { Holiday } from "./Holidays/datatable/types";
import HolidayFormModal from "@/Components/modals/HolidayFormModal";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Holidays() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const tableRef = useRef<DataTableRef<Holiday>>(null);
  const [rowSelection, setRowSelection] = useState({});

  const {
    holidays: tableData,
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
    tableMeta,
    singleDeleteModalOpen,
    setSingleDeleteModalOpen,
    confirmSingleDeleteLoading,
    setConfirmSingleDeleteLoading,
    singleDeleteSuccess,
    setSingleDeleteSuccess,
    selectedRowForDelete,
    openSingleDeleteModal,
    closeSingleDeleteModal,
    handleSingleDeleteRow,
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    selectedRowsForDelete,
    openBulkDeleteModal,
    closeBulkDeleteModal,
  } = useHolidayTable({
    initialData: holidays,
  });

  // Create columns
  const columns = createColumns({
    onDeleteRow: openSingleDeleteModal,
    t
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Update table data when holidays change
  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setHolidays(tableData);
    }
  }, [tableData]);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(route('holidays.index'));
      if (response.data.success) {
        const fetchedHolidays = response.data.data;
        setHolidays(fetchedHolidays);
        // Update the table data in the hook
        if (tableMeta.setHolidays) {
          tableMeta.setHolidays(fetchedHolidays);
        }
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      showToast({
        type: 'error',
        message: t('common.failed_to_fetch_holidays'),
      });
    }
  };

  const handleModalSuccess = () => {
    fetchHolidays();
  };

  const handleSingleDeleteRowWithToast = async () => {
    setConfirmSingleDeleteLoading(true);

    try {
      await tableMeta.deleteRow?.(
        selectedRowForDelete,
        (message) => {
          showToast({
            type: 'success',
            message: message || t('common.holiday_deleted_successfully'),
            duration: 3000,
          });
          setConfirmSingleDeleteLoading(false);
          closeSingleDeleteModal();
        },
        (errorMessage) => {
          showToast({
            type: 'error',
            message: errorMessage || t('common.failed_to_delete_holiday'),
            duration: 3000,
          });
          setConfirmSingleDeleteLoading(false);
        }
      );
    } catch (error) {
      showToast({
        type: 'error',
        message: t('common.failed_to_delete_holiday') || 'Failed to delete holiday',
        duration: 3000,
      });
      setConfirmSingleDeleteLoading(false);
    }
  };

  const handleBulkDeleteRowWithToast = async () => {
    setConfirmBulkDeleteLoading(true);

    try {
      await tableMeta.deleteRows?.(
        selectedRowsForDelete,
        (message) => {
          setRowSelection({});
          showToast({
            type: 'success',
            message: message || t('common.holidays_deleted_success') || `${selectedRowsForDelete.length} holidays deleted successfully`,
            duration: 3000,
          });
          setConfirmBulkDeleteLoading(false);
          closeBulkDeleteModal();
        },
        (errorMessage) => {
          showToast({
            type: 'error',
            message: errorMessage || t('common.failed_to_delete_holidays') || 'Failed to delete holidays',
            duration: 3000,
          });
          setConfirmBulkDeleteLoading(false);
        }
      );
    } catch (error) {
      showToast({
        type: 'error',
        message: t('common.failed_to_delete_holidays') || 'Failed to delete holidays',
        duration: 3000,
      });
      setConfirmBulkDeleteLoading(false);
    }
  };

  // Handle single delete modal state
  useEffect(() => {
    if (singleDeleteSuccess) {
      setTimeout(() => {
        closeSingleDeleteModal();
        setSingleDeleteSuccess(false);
      }, 1500);
    }
  }, [singleDeleteSuccess]);

  // Filter holidays based on global filter
  const filteredHolidays = globalFilter
    ? holidays.filter(holiday => {
        const searchTerm = globalFilter.toLowerCase();
        const dateRange = `${holiday.start_date} - ${holiday.end_date}`.toLowerCase();
        const reason = (holiday.reason || '').toLowerCase();
        return dateRange.includes(searchTerm) || reason.includes(searchTerm);
      })
    : holidays;

  // Sort holidays based on sorting state
  const sortedHolidays = [...filteredHolidays].sort((a, b) => {
    if (sorting.length === 0) {
      // Default sort by start_date descending
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    }

    const sort = sorting[0];
    const getAValue = (): number | string => {
      if (sort.id === 'date_range') {
        return new Date(a.start_date).getTime();
      } else if (sort.id === 'days_count') {
        const start = new Date(a.start_date);
        const end = new Date(a.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      } else if (sort.id === 'status') {
        return new Date(a.end_date) >= new Date() ? 'upcoming' : 'past';
      } else {
        return a[sort.id as keyof Holiday] || '';
      }
    };
    
    const getBValue = (): number | string => {
      if (sort.id === 'date_range') {
        return new Date(b.start_date).getTime();
      } else if (sort.id === 'days_count') {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      } else if (sort.id === 'status') {
        return new Date(b.end_date) >= new Date() ? 'upcoming' : 'past';
      } else {
        return b[sort.id as keyof Holiday] || '';
      }
    };

    const aValue = getAValue();
    const bValue = getBValue();

    if (sort.desc) {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.settings_holidays") || "Holidays"}
        description={t("common.page_descriptions.settings_holidays") || "Manage holidays and time off. Set dates when you are unavailable for appointments."}
      >
      <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
        <div className="transition-content w-full pb-5">
          {/* DataTable */}
          <DataTable<Holiday>
              ref={tableRef}
              data={sortedHolidays}
              columns={columns}
              pagination={{
                pageIndex: 0,
                pageSize: 10,
                total: sortedHolidays.length,
                onChange: () => {}, // Client-side pagination handled by DataTable
              }}
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
                    openBulkDeleteModal(selectedRows);
                  }
                },
                deleteLabel: t('common.delete')
              }}
              slots={{
                toolbar: (table) => (
                  <Toolbar
                    table={table}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    sorting={sorting}
                    onAddHoliday={() => {
                      setSelectedHoliday(null);
                      setIsModalOpen(true);
                    }}
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
            description: selectedRowForDelete?.original
              ? t('common.confirm_delete_holiday') || 'Are you sure you want to delete this holiday?'
              : t('common.confirm_delete') || 'Are you sure you want to delete this holiday?',
          }
        }}
        onOk={handleSingleDeleteRowWithToast}
        confirmLoading={confirmSingleDeleteLoading}
        state="pending"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        show={bulkDeleteModalOpen}
        onClose={closeBulkDeleteModal}
        messages={{
          pending: {
            description: selectedRowsForDelete.length > 0
              ? t('common.confirm_delete_holidays') || `Are you sure you want to delete ${selectedRowsForDelete.length} holiday(s)?`
              : t('common.confirm_delete') || 'Are you sure you want to delete these holidays?',
          }
        }}
        onOk={handleBulkDeleteRowWithToast}
        confirmLoading={confirmBulkDeleteLoading}
        state="pending"
      />

      {/* Holiday Form Modal */}
      <HolidayFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHoliday(null);
        }}
        holiday={selectedHoliday}
        onSuccess={handleModalSuccess}
      />
      </Page>
    </MainLayout>
  );
}
