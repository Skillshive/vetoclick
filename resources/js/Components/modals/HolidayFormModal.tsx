import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button } from '@/components/ui';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { Input } from '@/components/ui';
import { useToast } from '@/components/common/Toast/ToastContext';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { Holiday } from '@/Pages/Settings/Holidays/datatable/types';
import { z } from 'zod';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

// Holiday form schema
const holidaySchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

type HolidayFormData = z.infer<typeof holidaySchema>;

interface HolidayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  holiday?: Holiday | null;
  errors?: Record<string, string>;
  onSuccess?: () => void;
}

export default function HolidayFormModal({ isOpen, onClose, holiday, errors, onSuccess }: HolidayFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!holiday;
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof HolidayFormData, string>>>({});
  const [startDate, setStartDate] = useState<Date[]>([]);
  const [endDate, setEndDate] = useState<Date[]>([]);
  const [processing, setProcessing] = useState(false);
  
  const [data, setData] = useState<HolidayFormData>({
    start_date: holiday?.start_date || '',
    end_date: holiday?.end_date || '',
    reason: holiday?.reason || '',
  });

  useEffect(() => {
    if (holiday) {
      const start = holiday.start_date ? new Date(holiday.start_date) : null;
      const end = holiday.end_date ? new Date(holiday.end_date) : null;
      setStartDate(start ? [start] : []);
      setEndDate(end ? [end] : []);
      setData({
        start_date: holiday.start_date || '',
        end_date: holiday.end_date || '',
        reason: holiday.reason || '',
      });
    } else {
      setData({
        start_date: '',
        end_date: '',
        reason: '',
      });
      setStartDate([]);
      setEndDate([]);
    }
    setValidationErrors({});
  }, [holiday, isOpen]);

  // Real-time validation
  const validateField = (field: keyof HolidayFormData, value: any) => {
    try {
      if (field === 'start_date' || field === 'end_date') {
        // Validate date range
        const result = holidaySchema.safeParse({
          start_date: field === 'start_date' ? value : data.start_date,
          end_date: field === 'end_date' ? value : data.end_date,
          reason: data.reason,
        });
        if (!result.success) {
          const fieldErrors = result.error.flatten().fieldErrors;
          if (fieldErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: fieldErrors[field]?.[0] }));
          } else {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
          }
        } else {
          setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
      } else {
        holidaySchema.shape[field].parse(value);
        setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } catch (error: any) {
      if (error.errors) {
        const errorMessage = error.errors[0]?.message;
        setValidationErrors(prev => ({ ...prev, [field]: errorMessage }));
      }
    }
  };

  const handleStartDateChange = (dates: Date[]) => {
    setStartDate(dates);
    if (dates[0]) {
      const dateStr = dates[0].toISOString().split('T')[0];
      setData(prev => ({ ...prev, start_date: dateStr }));
      validateField('start_date', dateStr);
      
      // If end date is before new start date, update end date
      if (endDate[0] && dates[0] > endDate[0]) {
        setEndDate(dates);
        setData(prev => ({ ...prev, end_date: dateStr }));
      }
    } else {
      setData(prev => ({ ...prev, start_date: '' }));
    }
  };

  const handleEndDateChange = (dates: Date[]) => {
    setEndDate(dates);
    if (dates[0]) {
      const dateStr = dates[0].toISOString().split('T')[0];
      setData(prev => ({ ...prev, end_date: dateStr }));
      validateField('end_date', dateStr);
    } else {
      setData(prev => ({ ...prev, end_date: '' }));
    }
  };

  const handleFieldChange = (field: keyof HolidayFormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = holidaySchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof HolidayFormData, string>> = {};
      
      Object.keys(fieldErrors).forEach((key) => {
        const field = key as keyof HolidayFormData;
        const errorMessages = fieldErrors[field];
        if (errorMessages && errorMessages.length > 0) {
          newErrors[field] = errorMessages[0];
        }
      });
      
      setValidationErrors(newErrors);
      return;
    }

    // Holidays currently only support creation, not editing
    // If editing is needed, add an update route in routes/web.php
    setProcessing(true);
    
    axios.post(route('holidays.store'), {
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason || null,
    })
    .then((response) => {
      if (response.data.success) {
        showToast({
          type: 'success',
          message: response.data.message || t('common.holiday_created_successfully') || 'Holiday created successfully',
          duration: 3000,
        });
        setValidationErrors({});
        setData({
          start_date: '',
          end_date: '',
          reason: '',
        });
        setStartDate([]);
        setEndDate([]);
        onClose();
        onSuccess?.();
      } else {
        throw new Error(response.data.message || t('common.failed_to_create_holiday') || 'Failed to create holiday');
      }
    })
    .catch((error: any) => {
      const errorMessage = error.response?.data?.message || error.message || t('common.failed_to_create_holiday') || 'Failed to create holiday';
      showToast({
        type: 'error',
        message: errorMessage,
        duration: 3000,
      });
    })
    .finally(() => {
      setProcessing(false);
    });
  };

  return (
    <Transition show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-700 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle className="flex items-center justify-between text-lg font-medium leading-6 text-gray-900 dark:text-dark-100">
                  <span>
                    {isEditing ? t('common.edit_holiday') : t('common.add_holiday')}
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </DialogTitle>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {isEditing
                    ? t('common.edit_holiday_info') || 'Edit holiday information'
                    : t('common.create_new_holiday') || 'Create a new holiday period'
                  }
                </p>
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Date Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          {t('common.start_date') || 'Start Date'}
                          <span className="text-red-500 mx-1">*</span>
                        </label>
                        <DatePicker
                          value={startDate}
                          onChange={handleStartDateChange}
                          options={{
                            dateFormat: "Y-m-d",
                          }}
                          placeholder={t('common.select_date') || 'Select start date'}
                          className={validationErrors.start_date ? 'border-red-500' : ''}
                        />
                        {validationErrors.start_date && (
                          <p className="mt-1 text-xs text-red-500">{t(validationErrors.start_date) || validationErrors.start_date}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          {t('common.end_date') || 'End Date'}
                          <span className="text-red-500 mx-1">*</span>
                        </label>
                        <DatePicker
                          value={endDate}
                          onChange={handleEndDateChange}
                          options={{
                            dateFormat: "Y-m-d",
                            minDate: startDate[0] || new Date(),
                          }}
                          placeholder={t('common.select_date') || 'Select end date'}
                          className={validationErrors.end_date ? 'border-red-500' : ''}
                        />
                        {validationErrors.end_date && (
                          <p className="mt-1 text-xs text-red-500">{t(validationErrors.end_date) || validationErrors.end_date}</p>
                        )}
                      </div>
                    </div>

                    {/* Reason Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('common.holiday_reason') || 'Reason (Optional)'}
                      </label>
                      <Input
                        type="text"
                        value={data.reason}
                        onChange={(e) => handleFieldChange('reason', e.target.value)}
                        placeholder={t('common.holiday_reason') || 'Enter holiday reason'}
                        className={validationErrors.reason ? 'border-red-500' : ''}
                        leftIcon={<CalendarIcon className="size-4" />}
                      />
                      {validationErrors.reason && (
                        <p className="mt-1 text-xs text-red-500">{t(validationErrors.reason) || validationErrors.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={onClose}
                      disabled={processing}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={processing}
                    >
                      {processing ? t('common.saving') : (isEditing ? t('common.update') : t('common.save'))}
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

