import MainLayout from '@/layouts/MainLayout';
import { DataTable, DataTableRef } from '@/components/shared/table/DataTable';
import { AppointmentPageProps, Appointment } from "./datatable/types";
import { useTranslation } from '@/hooks/useTranslation';
import { useAppointmentTable } from './datatable/hooks';
import { Toolbar } from './datatable/Toolbar';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useEffect, useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui';
import { 
  CheckBadgeIcon, 
  ClockIcon, 
  XCircleIcon, 
  CubeIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { ReportModal } from './datatable/ReportModal';
import { PlusSmallIcon } from '@heroicons/react/24/outline';

export default function Index({appointments, filters, vets, clients, statuses, old, errors}: AppointmentPageProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { props } = usePage();
    const tableRef = useRef<DataTableRef<Appointment>>(null);
    const [rowSelection, setRowSelection] = useState({});
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(window.location.href);
    const isUpdatingUrl = useRef(false);
    
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [cancelSuccess, setCancelSuccess] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [confirmCancelLoading, setConfirmCancelLoading] = useState(false);

    const handleConfirmCancel = () => {
        if (!selectedAppointment) return;

        setConfirmCancelLoading(true);
        setCancelError(null);
        setCancelSuccess(false);

        router.delete(route('appointments.cancel', selectedAppointment.uuid), {
            onSuccess: () => {
                setCancelModalOpen(false);
                setCancelSuccess(true);
                setConfirmCancelLoading(false);
                showToast({ type: 'success', message: t('common.appointment_cancelled_successfully') });
                console.log('hello')
                setTimeout(() => {
                    setCancelModalOpen(false);
                    setCancelSuccess(false); // Reset state
                }, 2000); // Use 2000ms
            },
            onError: (errors: any) => {
                setCancelError(errors.message || t('common.failed_to_cancel_appointment'));
                setConfirmCancelLoading(false);
                showToast({ type: 'error', message: t('common.failed_to_cancel_appointment') });
            }
        });
    };

    const handleReport = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setReportModalOpen(true);
    };

    const handleCancel = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setCancelModalOpen(true);
    };

    const {
        appointments: tableData,
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

        // Table state
        globalFilter,
        setGlobalFilter,
        sorting,
        setSorting,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        tableSettings,
        setTableSettings,
        pagination,
        setPagination,
        columns,
        tableMeta,
    } = useAppointmentTable({
        appointments,
        filters,
        rowSelection,
        setRowSelection,
        showToast,
        t,
        onReport: handleReport,
        onCancel: handleCancel,
    });

    // Handle flash messages
    useEffect(() => {
        if (props.flash?.success) {
            showToast({
                type: 'success',
                message: props.flash.success,
                duration: 3000,
            });
        }
        if (props.flash?.error) {
            showToast({
                type: 'error',
                message: props.flash.error,
                duration: 3000,
            });
        }
    }, [props.flash, showToast]);

    // Initialize filters from URL parameters
    useEffect(() => {
        if (!filtersInitialized && filters) {
            setGlobalFilter(filters.search || '');
            setSorting([{
                id: filters.sort_by || 'created_at',
                desc: filters.sort_direction === 'desc'
            }]);
            setPagination({
                pageIndex: (filters.page || 1) - 1,
                pageSize: filters.per_page || 10,
                total: appointments.meta?.total || 0,
                onChange: (newPagination: { pageIndex: number; pageSize: number }) => {
                    if (isUpdatingUrl.current) return;
                    
                    isUpdatingUrl.current = true;
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', (newPagination.pageIndex + 1).toString());
                    params.set('per_page', newPagination.pageSize.toString());
                    router.get(`${window.location.pathname}?${params.toString()}`, {
                        preserveState: true,
                        replace: true,
                        onFinish: () => {
                            isUpdatingUrl.current = false;
                        }
                    });
                }
            });
            setFiltersInitialized(true);
        }
    }, [filters, filtersInitialized, setGlobalFilter, setSorting, setPagination, appointments.meta?.total]);

    // Handle search changes with debouncing
    useEffect(() => {
        if (!filtersInitialized || isUpdatingUrl.current) return;

        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const currentSearch = params.get('search') || '';
            
            // Only update if the search has actually changed
            if (globalFilter !== currentSearch) {
                isUpdatingUrl.current = true;
                
                if (globalFilter) {
                    params.set('search', globalFilter);
                } else {
                    params.delete('search');
                }
                params.set('page', '1'); 
                
                router.get(`${window.location.pathname}?${params.toString()}`, {
                    preserveState: true,
                    replace: true,
                    onFinish: () => {
                        isUpdatingUrl.current = false;
                    }
                });
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [globalFilter, filtersInitialized]);

    // Handle URL changes (browser back/forward)
    useEffect(() => {
        const handleUrlChange = () => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                setCurrentUrl(newUrl);
            }
        };

        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, [currentUrl]);

    // Handle bulk delete
    const openBulkModal = () => {
        setBulkDeleteModalOpen(true);
    };

    
    const cancelState = cancelError ? "error" : cancelSuccess ? "success" : "pending";

    // Calculate stats from appointments data
    const totalAppointments = appointments.meta?.total || 0;
    const completedAppointments = appointments.data.filter(appointment => appointment.status === 'completed').length;
    const inProgressAppointments = appointments.data.filter(appointment => appointment.status === 'in_progress').length;
    const cancelledAppointments = appointments.data.filter(appointment => appointment.status === 'cancelled').length;
    const videoAppointments = appointments.data.filter(appointment => appointment.is_video_conseil).length;
    const onSiteAppointments = appointments.data.filter(appointment => !appointment.is_video_conseil).length;


    return <MainLayout>
        <div className="transition-content grid grid-cols-1 grid-rows-[auto_1fr] px-(--margin-x) py-4">
        <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
        "py-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800">
            {t('common.appointments')}
          </h2>
        </div>
        
      </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {totalAppointments}
                        </p>
                        <CubeIcon className="text-primary-500 size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.appointments')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {completedAppointments}
                        </p>
                        <CheckBadgeIcon className="text-success size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.consultation_status_completed')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {inProgressAppointments}
                        </p>
                        <ClockIcon className="text-warning size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.consultation_status_in_progress')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {cancelledAppointments}
                        </p>
                        <XCircleIcon className="text-error size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.consultation_status_cancelled')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {videoAppointments}
                        </p>
                        <CurrencyDollarIcon className="text-info size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.video_appointments')}</p>
                </div>
                <div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                            {onSiteAppointments}
                        </p>
                        <PlusIcon className="text-secondary size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{t('common.on_site_appointments')}</p>
                </div>
            </div>

            <div className="flex flex-col pt-6">
                <DataTable<Appointment>
                    ref={tableRef}
                    data={appointments.data}
                    columns={columns}
                    pagination={pagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={(updaterOrValue) => {
                        if (typeof updaterOrValue === 'function') {
                            setColumnVisibility(updaterOrValue);
                        } else {
                            setColumnVisibility(updaterOrValue);
                        }
                    }}
                    columnPinning={columnPinning}
                    onColumnPinningChange={setColumnPinning}
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
                                clients={clients}
                                statuses={statuses}
                            />
                        )
                    }}
                    meta={tableMeta}
                />
            </div>
        </div>

        <ConfirmModal
            show={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            onOk={handleConfirmCancel}
            state="pending"
            confirmLoading={confirmCancelLoading}
            messages={{
                pending: {
                    title: t('common.confirm_cancel'),
                    description: t('common.confirm_cancel_appointment'),
                    actionText: t('common.cancel'),
                }
            }}
        />

        <ReportModal 
            show={reportModalOpen} 
            onClose={() => setReportModalOpen(false)} 
            appointment={selectedAppointment} 
        />
    </MainLayout>
}