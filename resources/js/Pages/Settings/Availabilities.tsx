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
          if (grouped[slot.day_of_week] && slot.start_time && slot.end_time) {
            grouped[slot.day_of_week].push({
              uuid: slot.uuid,
              day_of_week: slot.day_of_week,
              start_time: typeof slot.start_time === 'string' ? slot.start_time.substring(0, 5) : slot.start_time,
              end_time: typeof slot.end_time === 'string' ? slot.end_time.substring(0, 5) : slot.end_time,
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
    // Validate times are within allowed range (08:00 - 19:00)
    const startMinutes = timeToMinutes(newSlot.start_time);
    const endMinutes = timeToMinutes(newSlot.end_time);
    const minMinutes = 8 * 60; // 08:00
    const maxMinutes = 19 * 60; // 19:00
    
    if (startMinutes < minMinutes || startMinutes > maxMinutes) {
      showToast({
        type: 'error',
        message: t('common.time_range_error') || 'Start time must be between 08:00 and 19:00',
      });
      return;
    }
    
    if (endMinutes < minMinutes || endMinutes > maxMinutes) {
      showToast({
        type: 'error',
        message: t('common.time_range_error') || 'End time must be between 08:00 and 19:00',
      });
      return;
    }
    
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
    let overlappingSlot: AvailabilitySlot | null = null;
    
    // Check if trying to add exact duplicate
    const isExactDuplicate = daySlots.some(slot => 
      slot.start_time === newSlot.start_time && 
      slot.end_time === newSlot.end_time && 
      slot.is_break === newSlot.is_break
    );
    
    if (isExactDuplicate) {
      showToast({
        type: 'error',
        message: t('common.duplicate_slot_error') || `A slot already exists for ${formatTime(newSlot.start_time)} - ${formatTime(newSlot.end_time)}`,
      });
      return;
    }
    
    for (const slot of daySlots) {
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);
      const newStart = timeToMinutes(newSlot.start_time);
      const newEnd = timeToMinutes(newSlot.end_time);
      
      // Check if times overlap (allowing exact touching: one ends when another starts)
      // Overlap means: new slot starts before existing ends AND new slot ends after existing starts
      // Using < and > (not <= and >=) allows exact touching (e.g., 12:00-13:00 and 13:00-14:00 are allowed)
      const timesOverlap = (newStart < slotEnd && newEnd > slotStart);
      
      if (!timesOverlap) {
        continue; // No time overlap, so no conflict
      }
      
      // If both are breaks, they cannot overlap
      if (newSlot.is_break && slot.is_break) {
        overlappingSlot = slot;
        break; // Breaks cannot overlap with each other
      }
      
      // If both are availability slots, they cannot overlap
      if (!newSlot.is_break && !slot.is_break) {
        overlappingSlot = slot;
        break; // Availability slots cannot overlap with each other
      }
      
      // If one is a break and one is availability, allow overlap
    }

    if (overlappingSlot !== null) {
      let errorMessage: string;
      if (newSlot.is_break) {
        errorMessage = t('common.break_slot_overlap');
      } else {
        const overlappingSlotType = overlappingSlot.is_break 
          ? t('common.break') 
          : t('common.available');
        errorMessage = `${t('common.availability_slot_overlap_error')} Existing slot: ${formatTime(overlappingSlot.start_time)} - ${formatTime(overlappingSlot.end_time)}. Your slot: ${formatTime(newSlot.start_time)} - ${formatTime(newSlot.end_time)}`;
      }
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
        showToast({
          type: 'success',
          message: t('common.availability_saved'),
        });

        // Reset form
        setNewSlot({ start_time: '09:00', end_time: '17:00', is_break: false });
        
        // Refresh from server to ensure everything is in sync and all slots are shown
        await fetchAvailability();
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

  // Timeline component helper functions
  const getTimelinePosition = (time: string, startHour: number = 8, endHour: number = 19): number => {
    const totalMinutes = (endHour - startHour) * 60;
    const [hours, minutes] = time.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;
    const startMinutes = startHour * 60;
    const relativeMinutes = timeMinutes - startMinutes;
    return Math.max(0, Math.min(100, (relativeMinutes / totalMinutes) * 100));
  };

  const getTimelineRange = (slots: AvailabilitySlot[]): { startHour: number; endHour: number } => {
    // Always show full timeline from 08:00 to 19:00
    return { startHour: 8, endHour: 19 };
  };

  return (
    <MainLayout>
      <div className="transition-content px-(--margin-x) pb-6 my-5" dir={isRtl ? 'rtl' : 'ltr'}>
        
        <Card className="p-6 sm:p-8">
          <div className="mb-8 border-b border-gray-200 dark:border-dark-600 pb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('common.availability_management')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
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
              {/* Day Selector - Professional Tabs */}
              <div className={`border-b border-gray-200 dark:border-dark-600 ${rtlClasses.flexRow}`}>
                <div className={`flex flex-wrap ${isRtl ? 'flex-row-reverse' : 'flex-row'} ${rtlClasses.justifyStart} -mb-px`}>
                {(isRtl ? [...DAYS].reverse() : DAYS).map(day => (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDay(day.value)}
                      className={`px-5 py-3 font-medium text-sm transition-colors border-b-2 ${rtlClasses.textStart} ${
                      selectedDay === day.value
                          ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-500'
                    }`}
                  >
                    {t(day.labelKey)}
                  </button>
                ))}
                </div>
              </div>

              {/* Current Day Availabilities */}
              <div className="space-y-6">
                <div className={`flex items-center justify-between ${rtlClasses.flexRow}`}>
                  {isRtl ? (
                    <>
                      <span className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {(availabilities[selectedDay] || []).length} {t('common.slots')}
                      </span>
                      <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${rtlClasses.textEnd}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {t(DAYS.find(d => d.value === selectedDay)?.labelKey || 'common.days.monday')}
                      </h3>
                    </>
                  ) : (
                    <>
                   {/*    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {t(DAYS.find(d => d.value === selectedDay)?.labelKey || 'common.days.monday')}
                      </h3>
                      <span className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${rtlClasses.textEnd}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {(availabilities[selectedDay] || []).length} {t('common.slots')}
                      </span>*/}
                    </>
                  )}
                </div>

                {/* Timeline Visualization */}
                {(() => {
                  const daySlots = availabilities[selectedDay] || [];
                  
                  if (daySlots.length === 0) {
                    return (
                      <div className="mb-6">
                        <div className={`flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-800/50 ${rtlClasses.textStart}`}>
                          <ClockIcon className="size-10 mb-3 opacity-40" />
                          <p className={`text-sm font-medium ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {t('common.no_availability_slots')}
                      </p>
                    </div>
                      </div>
                    );
                  }
                  
                  const { startHour, endHour } = getTimelineRange(daySlots);
                  const timeLabels: string[] = [];
                  for (let h = startHour; h <= endHour; h++) {
                    timeLabels.push(`${h.toString().padStart(2, '0')}:00`);
                  }
                  
                  return (
                    <div className="mb-6">
                      <div className="relative bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 shadow-sm p-6">
                        {/* Time labels */}
                        <div className="relative mb-6" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                          <div className="relative mb-3" style={{ minHeight: '1.25rem' }}>
                            {timeLabels.map((label, index) => {
                              const hour = parseInt(label.split(':')[0]);
                              const position = getTimelinePosition(`${hour.toString().padStart(2, '0')}:00`, startHour, endHour);
                              const isFirst = index === 0;
                              const isLast = index === timeLabels.length - 1;
                              return (
                                <span
                                  key={index}
                                  className={`absolute text-xs font-medium text-gray-600 dark:text-gray-400 ${isFirst || isLast ? '' : 'transform -translate-x-1/2'}`}
                                  style={{ 
                                    left: `${position}%`,
                                    ...(isFirst ? { transform: 'translateX(0)' } : isLast ? { transform: 'translateX(-100%)' } : {}),
                                  }}
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Timeline track container */}
                          <div className="relative" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                            {/* Timeline track */}
                            <div className="relative h-2.5 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden border border-gray-200 dark:border-dark-600">
                              {/* Background availability slots - clickable */}
                              {(() => {
                                const availableSlots = daySlots
                                  .filter(slot => slot && slot.start_time && slot.end_time && !slot.is_break)
                                  .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
                                
                                console.log(`[Timeline Render] Found ${availableSlots.length} available slots:`, availableSlots.map(s => `${s.start_time}-${s.end_time} (${s.uuid})`));
                                
                                return availableSlots.map((slot, index) => {
                                  const left = getTimelinePosition(slot.start_time, startHour, endHour);
                                  const right = getTimelinePosition(slot.end_time, startHour, endHour);
                                  const width = Math.max(0, right - left);
                                  
                                  console.log(`[Rendering Slot ${index + 1}] UUID: ${slot.uuid}, Time: ${slot.start_time}-${slot.end_time}, Left: ${left}%, Width: ${width}%`);
                                  
                                  return (
                                    <div
                                      key={`slot-${slot.uuid}`}
                                      data-slot-uuid={slot.uuid}
                                      data-slot-time={`${slot.start_time}-${slot.end_time}`}
                                      data-position={`left:${left}% width:${width}%`}
                                      className="absolute h-full bg-primary-600 dark:bg-primary-500 rounded-full hover:bg-primary-700 dark:hover:bg-primary-600 cursor-pointer transition-all hover:shadow-md group z-0"
                                      style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                        minWidth: width > 0 ? '2px' : '0',
                                        top: 0,
                                        bottom: 0,
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSlot(slot.uuid!, selectedDay);
                                      }}
                                      title={`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)} (${t('common.click_to_delete') || 'Click to delete'})`}
                                    >
                                      {/* Subtle markers at start and end */}
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-dark-800 opacity-80"></div>
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-dark-800 opacity-80"></div>
                                    </div>
                                  );
                                });
                              })()}
                              
                              {/* Break slots (not available) - clickable */}
                              {daySlots
                                .filter(slot => slot.is_break)
                                .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))
                                .map((slot) => {
                                  const left = getTimelinePosition(slot.start_time, startHour, endHour);
                                  const right = getTimelinePosition(slot.end_time, startHour, endHour);
                                  const width = right - left;
                                  
                                  return (
                                    <div
                                      key={`break-${slot.uuid || slot.start_time}-${slot.end_time}`}
                                      className="absolute h-full bg-red-500 dark:bg-red-600 rounded-full hover:bg-red-600 dark:hover:bg-red-700 cursor-pointer transition-all hover:shadow-md group relative z-10"
                                      style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                      }}
                                      onClick={() => handleDeleteSlot(slot.uuid!, selectedDay)}
                                      title={`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)} (${t('common.click_to_delete') || 'Click to delete'})`}
                                    >
                                      {/* Subtle markers at start and end */}
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-dark-800 opacity-80"></div>
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white dark:bg-dark-800 opacity-80"></div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className={`flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-dark-600 ${isRtl ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
                          <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-500"></div>
                            <span className={`text-xs font-medium text-gray-700 dark:text-gray-300 ${rtlClasses.textStart}`}>
                              {t('common.available')}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-600"></div>
                            <span className={`text-xs font-medium text-gray-700 dark:text-gray-300 ${rtlClasses.textStart}`}>
                              {t('common.not_available') || 'Not Available'}
                          </span>
                          </div>
                        </div>
                      </div>
                </div>
                  );
                })()}

                {/* Add New Slot Form */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-900 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm p-6 sm:p-7">
            {/*       <div className="mb-6">
                    <h4 className={`text-lg font-semibold text-gray-900 dark:text-white mb-1 ${rtlClasses.textStart}`}>
                    {t('common.add_availability_slot')}
                    </h4>
                    <p className={`text-xs text-gray-500 dark:text-gray-400 ${rtlClasses.textStart}`}>
                      {t('common.select_time_range') || 'Select a time range between 08:00 and 19:00'}
                    </p>
                  </div>*/}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    {/* Start Time */}
                    <div className="sm:col-span-3">
                      <label className={`block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2.5 uppercase tracking-wide ${rtlClasses.textStart}`}>
                        {t('common.start_time')}
                      </label>
                      <div className="relative">
                      <Timepicker
                        value={newSlot.start_time}
                          onChange={(dates, dateStr) => {
                            const timeMinutes = timeToMinutes(dateStr);
                            const minMinutes = 8 * 60; // 08:00
                            const maxMinutes = 19 * 60; // 19:00
                            if (timeMinutes >= minMinutes && timeMinutes <= maxMinutes) {
                              setNewSlot({ ...newSlot, start_time: dateStr });
                            } else {
                              showToast({
                                type: 'error',
                                message: t('common.time_range_error') || 'Time must be between 08:00 and 19:00',
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="sm:col-span-1 flex items-end justify-center pb-2.5">
                      <span className="text-gray-400 dark:text-gray-500 font-medium">—</span>
                    </div>

                    {/* End Time */}
                    <div className="sm:col-span-3">
                      <label className={`block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2.5 uppercase tracking-wide ${rtlClasses.textStart}`}>
                        {t('common.end_time')}
                      </label>
                      <div className="relative">
                      <Timepicker
                        value={newSlot.end_time}
                          onChange={(dates, dateStr) => {
                            const timeMinutes = timeToMinutes(dateStr);
                            const minMinutes = 8 * 60; // 08:00
                            const maxMinutes = 19 * 60; // 19:00
                            if (timeMinutes >= minMinutes && timeMinutes <= maxMinutes) {
                              setNewSlot({ ...newSlot, end_time: dateStr });
                            } else {
                              showToast({
                                type: 'error',
                                message: t('common.time_range_error') || 'Time must be between 08:00 and 19:00',
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Break Checkbox */}
                    <div className="sm:col-span-2 flex items-end pb-2.5">
                      <label className={`flex items-center gap-3 cursor-pointer group ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="relative">
                        <input
                          type="checkbox"
                          checked={newSlot.is_break}
                          onChange={(e) => setNewSlot({ ...newSlot, is_break: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-2 border-gray-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all checked:bg-primary-600 checked:border-primary-600 dark:checked:bg-primary-500 dark:checked:border-primary-500"
                        />
                        </div>
                        <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${rtlClasses.textStart}`} dir={isRtl ? 'rtl' : 'ltr'}>
                          {t('common.mark_as_break')}
                        </span>
                      </label>
                    </div>

                    {/* Add Button */}
                    <div className="sm:col-span-3">
                      <button
                        onClick={() => handleAddSlot(selectedDay)}
                        className={`w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 ${rtlClasses.flexRow}`}
                      >
                        <PlusIcon className="size-5" />
                        <span>{t('common.add_slot')}</span>
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
