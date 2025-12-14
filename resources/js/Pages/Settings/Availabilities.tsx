// Import Dependencies
import { useEffect, useState } from "react";
import axios from "axios";

// Local Imports
import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import MainLayout from "@/layouts/MainLayout";
import { PlusIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Timepicker } from "@/components/shared/form/Timepicker";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface AvailabilitySlot {
  uuid?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_break?: boolean;
}

const DAYS = [
  { value: 'monday', labelKey: 'common.days.monday' },
  { value: 'tuesday', labelKey: 'common.days.tuesday' },
  { value: 'wednesday', labelKey: 'common.days.wednesday' },
  { value: 'thursday', labelKey: 'common.days.thursday' },
  { value: 'friday', labelKey: 'common.days.friday' },
  { value: 'saturday', labelKey: 'common.days.saturday' },
];

export default function Availabilities() {
  const { t } = useTranslation();
  const { isRtl, rtlClasses } = useRTL();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [availabilities, setAvailabilities] = useState<Record<string, AvailabilitySlot[]>>({});
  const [isLoading, setIsLoading] = useState(true);
const [statistics, setStatistics] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [newSlot, setNewSlot] = useState({ start_time: '09:00', end_time: '17:00', is_break: false });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(route('availability.getCurrentWeek'));
      if (response.data.success) {
        setStatistics(response.data);
        
        // Group availabilities by day
        const grouped: Record<string, AvailabilitySlot[]> = {};
        DAYS.forEach(day => {
          grouped[day.value] = [];
        });

        response.data.data.forEach((slot: any) => {
          if (grouped[slot.day_of_week]) {
            grouped[slot.day_of_week].push({
              uuid: slot.uuid,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time.substring(0, 5), // Remove seconds
              end_time: slot.end_time.substring(0, 5),
              is_break: slot.is_break || false // Read from response if available
            });
          }
        });

        setAvailabilities(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      showToast({
        type: 'error',
        message: t('common.error_loading_availability'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async (day: string) => {
    // Validate times
    if (newSlot.start_time >= newSlot.end_time) {
      showToast({
        type: 'error',
        message: t('common.end_time_after_start'),
      });
      return;
    }

    // Check for overlaps
    // Breaks can overlap with availability slots, but:
    // - Availability slots cannot overlap with other availability slots
    // - Breaks cannot overlap with other breaks
    const daySlots = availabilities[day] || [];
    const hasOverlap = daySlots.some(slot => {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);
      const newStart = timeToMinutes(newSlot.start_time);
      const newEnd = timeToMinutes(newSlot.end_time);
      
      // Check if times overlap
      const timesOverlap = (newStart < slotEnd && newEnd > slotStart);
      
      if (!timesOverlap) {
        return false; // No time overlap, so no conflict
      }
      
      // If both are breaks, they cannot overlap
      if (newSlot.is_break && slot.is_break) {
        return true; // Breaks cannot overlap with each other
      }
      
      // If both are availability slots, they cannot overlap
      if (!newSlot.is_break && !slot.is_break) {
        return true; // Availability slots cannot overlap with each other
      }
      
      // If one is a break and one is availability, allow overlap
      return false;
    });

    if (hasOverlap) {
      const errorMessage = newSlot.is_break 
        ? t('common.break_slot_overlap')
        : t('common.availability_slot_overlap_error');
      showToast({
        type: 'error',
        message: errorMessage,
      });
      return;
    }

    try {
      const payload = {
        day_of_week: day,
        start_time: newSlot.start_time + ':00',
        end_time: newSlot.end_time + ':00',
        is_break: newSlot.is_break || false,
      };
      
      console.log('Sending availability request:', payload);
      
      const response = await axios.post(route('availability.store'), payload);

      if (response.data.success) {
        const newAvailability: AvailabilitySlot = {
          uuid: response.data.data.uuid,
          day_of_week: day,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          is_break: newSlot.is_break
        };

        setAvailabilities(prev => ({
          ...prev,
          [day]: [...(prev[day] || []), newAvailability].sort((a, b) => 
            timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
          )
        }));
        
        showToast({
          type: 'success',
          message: t('common.availability_saved'),
        });

        // Reset form
        setNewSlot({ start_time: '09:00', end_time: '17:00', is_break: false });
        
        // Refresh statistics
        fetchAvailability();
      }
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      let errorMessage = t('common.error_saving_availability');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleDeleteSlot = async (uuid: string, day: string) => {
    const confirmed = await confirm({
      title: t('common.are_you_sure'),
      message: t('common.confirm_delete_availability'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await axios.delete(route('availability.destroy', { uuid }));
        setAvailabilities(prev => ({
          ...prev,
          [day]: (prev[day] || []).filter(slot => slot.uuid !== uuid)
        }));
        showToast({
          type: 'success',
          message: t('common.availability_deleted'),
        });
        
        // Refresh statistics
        fetchAvailability();
      } catch (error) {
        console.error('Failed to delete availability:', error);
        showToast({
          type: 'error',
          message: t('common.error_deleting_availability'),
        });
      }
    }
  };

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (time: string): string => {
    return time.substring(0, 5);
  };

  return (
    <MainLayout>
      <div className="transition-content px-(--margin-x) pb-6 my-5" dir={isRtl ? 'rtl' : 'ltr'}>
        
        <Card className="p-4 sm:p-6">
          <div className="mb-6">
            <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800 mb-1">
            {t('common.availability_management')}
          </h5>
            <p className="dark:text-dark-200 text-sm text-gray-500">
            {t('common.set_weekly_availability')}
          </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t('common.loading')}...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Day Selector */}
              <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'} ${rtlClasses.justifyStart}`}>
                {(isRtl ? [...DAYS].reverse() : DAYS).map(day => (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDay(day.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${rtlClasses.textStart} ${
                      selectedDay === day.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {t(day.labelKey)}
                  </button>
                ))}
              </div>

              {/* Current Day Availabilities */}
              <div className="space-y-4">
                <div className={`flex items-center justify-between ${rtlClasses.flexRow}`}>
                  {isRtl ? (
                    <>
                      <span className={`text-sm text-gray-500 dark:text-gray-400 ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {(availabilities[selectedDay] || []).length} {t('common.slots')}
                      </span>
                      <h6 className={`text-base font-medium text-gray-800 dark:text-dark-100 ${rtlClasses.textEnd}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {t(DAYS.find(d => d.value === selectedDay)?.labelKey || 'common.days.monday')} {t('common.availability')}
                      </h6>
                    </>
                  ) : (
                    <>
                      <h6 className={`text-base font-medium text-gray-800 dark:text-dark-100 ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {t(DAYS.find(d => d.value === selectedDay)?.labelKey || 'common.days.monday')} {t('common.availability')}
                      </h6>
                      <span className={`text-sm text-gray-500 dark:text-gray-400 ${rtlClasses.textEnd}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {(availabilities[selectedDay] || []).length} {t('common.slots')}
                      </span>
                    </>
                  )}
                </div>

                {/* Existing Slots */}
                <div className={`space-y-2 ${rtlClasses.textStart}`}>
                  {(availabilities[selectedDay] || []).length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg ${rtlClasses.textStart}`}>
                      <ClockIcon className="size-12 mb-3 opacity-50" />
                      <p className={rtlClasses.textStart} dir={isRtl ? 'rtl' : 'ltr'}>
                        {t('common.no_availability_slots')}
                      </p>
                    </div>
                  ) : (
                    (availabilities[selectedDay] || []).map((slot) => (
                      <div
                        key={slot.uuid}
                        className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 ${rtlClasses.flexRow}`}
                      >
                        {/* Left side: Time with icon and badge */}
                        <div className={`flex items-center gap-4 ${rtlClasses.flexRow}`}>
                          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <ClockIcon className="size-5 text-primary-600 flex-shrink-0" />
                            <span className={`font-medium text-gray-800 dark:text-dark-100 ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded ${rtlClasses.textStart} ${
                            slot.is_break 
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' 
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          }`} dir={isRtl ? 'rtl' : 'ltr'}>
                            {slot.is_break ? t('common.break') : t('common.available')}
                          </span>
                        </div>
                        
                        {/* Right side: Delete button */}
                        <button
                          onClick={() => handleDeleteSlot(slot.uuid!, selectedDay)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                          title={t('common.delete')}
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Slot Form */}
                <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-200 dark:border-primary-800">
                  <h6 className={`text-sm font-medium text-gray-800 dark:text-dark-100 mb-4 ${rtlClasses.textStart}`}>
                    {t('common.add_availability_slot')}
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ${rtlClasses.textStart}`}>
                        {t('common.start_time')}
                      </label>
                      <Timepicker
                        value={newSlot.start_time}
                        onChange={(dates, dateStr) => setNewSlot({ ...newSlot, start_time: dateStr })}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ${rtlClasses.textStart}`}>
                        {t('common.end_time')}
                      </label>
                      <Timepicker
                        value={newSlot.end_time}
                        onChange={(dates, dateStr) => setNewSlot({ ...newSlot, end_time: dateStr })}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className={`flex items-center gap-2 cursor-pointer ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <input
                          type="checkbox"
                          checked={newSlot.is_break}
                          onChange={(e) => setNewSlot({ ...newSlot, is_break: e.target.checked })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className={`text-sm text-gray-700 dark:text-gray-300 ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                          {t('common.mark_as_break')}
                        </span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleAddSlot(selectedDay)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium ${rtlClasses.flexRow}`}
                      >
                        <PlusIcon className="size-5" />
                        {t('common.add_slot')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
