// Import Dependencies
import { useEffect, useState } from "react";
import axios from "axios";

// Local Imports
import { Card, Button, Badge, Input, Spinner } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import MainLayout from "@/layouts/MainLayout";
import { PlusIcon, TrashIcon, CalendarIcon } from "@heroicons/react/24/outline";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Holiday {
  uuid?: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export default function Holidays() {
  const { t } = useTranslation();
  const { isRtl, rtlClasses } = useRTL();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState({ start_date: null as Date[] | null, end_date: null as Date[] | null, reason: '' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(route('holidays.index'));
      if (response.data.success) {
        setHolidays(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      showToast({
        type: 'error',
        message: t('common.failed_to_fetch_holidays'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.start_date || !newHoliday.start_date[0] || !newHoliday.end_date || !newHoliday.end_date[0]) {
      showToast({
        type: 'error',
        message: t('common.holiday_date') + ' ' + t('common.required'),
      });
      return;
    }

    const startDateStr = newHoliday.start_date[0].toISOString().split('T')[0];
    const endDateStr = newHoliday.end_date[0].toISOString().split('T')[0];

    if (new Date(endDateStr) < new Date(startDateStr)) {
      showToast({
        type: 'error',
        message: t('common.end_date_must_be_after_start_date'),
      });
      return;
    }

    try {
      const response = await axios.post(route('holidays.store'), {
        start_date: startDateStr,
        end_date: endDateStr,
        reason: newHoliday.reason || null,
      });

      if (response.data.success) {
        showToast({
          type: 'success',
          message: t('common.holiday_created_successfully'),
        });

        // Reset form and refresh list
        setNewHoliday({ start_date: null, end_date: null, reason: '' });
        await fetchHolidays();
      }
    } catch (error: any) {
      console.error('Failed to add holiday:', error);
      const errorMessage = error.response?.data?.message || t('common.failed_to_create_holiday');
      showToast({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleDeleteHoliday = async (uuid: string) => {
    const confirmDelete = await confirm({
      title: t('common.confirm'),
      message: t('common.confirm_delete_holiday'),
    });

    if (confirmDelete) {
      try {
        await axios.delete(route('holidays.destroy', uuid));
        
        showToast({
          type: 'success',
          message: t('common.holiday_deleted_successfully'),
        });
        
        // Refresh list
        fetchHolidays();
      } catch (error) {
        console.error('Failed to delete holiday:', error);
        showToast({
          type: 'error',
          message: t('common.failed_to_delete_holiday'),
        });
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRtl ? 'ar' : 'en', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysCount = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <MainLayout>
      <div className="transition-content px-(--margin-x) pb-6 my-5" dir={isRtl ? 'rtl' : 'ltr'}>
        <Card className="px-8 py-6 mt-4">
          <div className="w-full 4xl:max-w-6xl">
            <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
              {t('common.holidays')}
            </h5>
            <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
              {t('common.upcoming_holidays')}
            </p>
            <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

            {/* Add Holiday Form */}
            <div className="mb-8">
              <h6 className="dark:text-dark-100 text-base font-medium text-gray-800 mb-4">
                {t('common.add_holiday')}
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DatePicker
                  label={t('common.start_date') || 'Start Date'}
                  value={newHoliday.start_date || []}
                  onChange={(dates: Date[]) => {
                    setNewHoliday({ ...newHoliday, start_date: dates });
                    if (dates[0] && newHoliday.end_date && newHoliday.end_date[0] && dates[0] > newHoliday.end_date[0]) {
                      setNewHoliday({ ...newHoliday, start_date: dates, end_date: dates });
                    }
                  }}
                  options={{
                    dateFormat: "Y-m-d",
                    minDate: new Date(),
                  }}
                  placeholder={t('common.select_date') || 'Select start date'}
                  required
                />
                
                <DatePicker
                  label={t('common.end_date') || 'End Date'}
                  value={newHoliday.end_date || []}
                  onChange={(dates: Date[]) => setNewHoliday({ ...newHoliday, end_date: dates })}
                  options={{
                    dateFormat: "Y-m-d",
                    minDate: newHoliday.start_date?.[0] || new Date(),
                  }}
                  placeholder={t('common.select_date') || 'Select end date'}
                  required
                />
                
                <Input
                  label={t('common.holiday_reason')}
                  value={newHoliday.reason}
                  onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                  placeholder={t('common.holiday_reason')}
                  type="text"
                />
                
                <div className="flex items-end">
                  <Button
                    onClick={handleAddHoliday}
                    color="primary"
                    variant="filled"
                    className="w-full gap-2"
                  >
                    <PlusIcon className="size-5" />
                    {t('common.add_holiday')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Holidays List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner className="size-8" />
              </div>
            ) : holidays.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="mx-auto size-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">{t('common.no_holidays')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {holidays
                  .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                  .map((holiday) => {
                    const startDate = new Date(holiday.start_date);
                    const endDate = new Date(holiday.end_date);
                    const isUpcoming = endDate >= new Date();
                    const daysCount = getDaysCount(holiday.start_date, holiday.end_date);

                    return (
                      <div
                        key={holiday.uuid}
                        className="group relative rounded-lg bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-dark-500"
                      >
                        <div className="p-3">
                          {/* Header with icon, badge, and delete button */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-500 dark:bg-primary-600">
                                <CalendarIcon className="h-3.5 w-3.5 text-white" />
                              </div>
                              {isUpcoming && (
                                <Badge variant="soft" color="primary" className="text-[10px] px-1.5 py-0.5">
                                  {t('common.upcoming')}
                                </Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleDeleteHoliday(holiday.uuid!)}
                              variant="flat"
                              color="error"
                              isIcon
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
                            >
                              <TrashIcon className="size-3" />
                            </Button>
                          </div>

                          {/* Date Range */}
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 leading-tight">
                            {formatDateRange(holiday.start_date, holiday.end_date)}
                          </p>

                          {/* Days count and reason in same row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100/50 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-800/50">
                              <span className="text-[10px] font-semibold text-primary-700 dark:text-primary-300">
                                {daysCount}
                              </span>
                              <span className="text-[10px] font-medium text-primary-600 dark:text-primary-400">
                                {daysCount === 1 ? (t('common.day') || 'Day') : 'Days'}
                              </span>
                            </div>
                            {holiday.reason && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1 text-right">
                                {holiday.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
