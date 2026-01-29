// Import Dependencies
import { useEffect, useState } from "react";
import axios from "axios";

// Local Imports
import { Card, Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import MainLayout from "@/layouts/MainLayout";
import { PlusIcon, TrashIcon, ClockIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Timepicker } from "@/components/shared/form/Timepicker";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface AvailabilitySlot {
  uuid?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_break?: boolean;
  session?: string; // New field for session type
}

const DAYS = [
  { value: 'monday', labelKey: 'common.days.monday' },
  { value: 'tuesday', labelKey: 'common.days.tuesday' },
  { value: 'wednesday', labelKey: 'common.days.wednesday' },
  { value: 'thursday', labelKey: 'common.days.thursday' },
  { value: 'friday', labelKey: 'common.days.friday' },
  { value: 'saturday', labelKey: 'common.days.saturday' },
];

const SESSION_TYPES = [
  { value: 'morning', labelKey: 'common.sessions.morning' },
  { value: 'noon', labelKey: 'common.sessions.noon' },
  { value: 'afternoon', labelKey: 'common.sessions.afternoon' },
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
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
              is_break: slot.is_break || false,
              session: slot.session || 'morning', // Default to morning if not set
            });
          }
        });

        // Ensure each day has at least one empty slot if no slots exist
        DAYS.forEach(day => {
          if (grouped[day.value].length === 0) {
            grouped[day.value] = [{
              day_of_week: day.value,
              start_time: '09:00',
              end_time: '17:00',
              is_break: false,
              session: 'morning',
            }];
          }
        });

        setAvailabilities(grouped);
        setHasChanges(false);
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

  const handleAddRow = (day: string) => {
    const daySlots = availabilities[day] || [];
    const newSlot: AvailabilitySlot = {
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      is_break: false,
      session: 'morning',
    };
    
    setAvailabilities(prev => ({
      ...prev,
      [day]: [...daySlots, newSlot],
    }));
    setHasChanges(true);
  };

  const handleDeleteRow = (day: string, index: number) => {
    const daySlots = availabilities[day] || [];
    const slot = daySlots[index];
    
    if (slot.uuid) {
      // Existing slot - confirm deletion
      confirm({
        title: t('common.are_you_sure'),
        message: t('common.confirm_delete_availability'),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        confirmVariant: 'danger'
      }).then((confirmed) => {
        if (confirmed) {
          handleDeleteSlot(slot.uuid!, day, index);
        }
      });
    } else {
      // New slot - just remove from state
      const remainingSlots = daySlots.filter((_, i) => i !== index);
      // Ensure at least one empty slot remains
      if (remainingSlots.length === 0) {
        setAvailabilities(prev => ({
          ...prev,
          [day]: [{
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_break: false,
            session: 'morning',
          }],
        }));
      } else {
        setAvailabilities(prev => ({
          ...prev,
          [day]: remainingSlots,
        }));
      }
      setHasChanges(true);
    }
  };

  const handleDeleteSlot = async (uuid: string, day: string, index: number) => {
    try {
      await axios.delete(route('availability.destroy', { uuid }));
      const remainingSlots = (availabilities[day] || []).filter((_, i) => i !== index);
      // Ensure at least one empty slot remains
      if (remainingSlots.length === 0) {
        setAvailabilities(prev => ({
          ...prev,
          [day]: [{
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_break: false,
            session: 'morning',
          }],
        }));
      } else {
        setAvailabilities(prev => ({
          ...prev,
          [day]: remainingSlots,
        }));
      }
      showToast({
        type: 'success',
        message: t('common.availability_deleted'),
      });
      setHasChanges(true);
      // Don't refetch to preserve the empty slot we just added
    } catch (error) {
      console.error('Failed to delete availability:', error);
      showToast({
        type: 'error',
        message: t('common.error_deleting_availability'),
      });
    }
  };

  const handleUpdateSlot = (day: string, index: number, field: keyof AvailabilitySlot, value: any) => {
    const daySlots = availabilities[day] || [];
    const updatedSlots = [...daySlots];
    const updatedSlot = {
      ...updatedSlots[index],
      [field]: value,
    };
    
    // If session type changed, validate immediately
    if (field === 'session') {
      const error = validateSlot(updatedSlot);
      if (error) {
        showToast({
          type: 'error',
          message: error,
          duration: 4000,
        });
        return; // Don't update if validation fails
      }
    }
    
    // If time changed, validate against current session and check for conflicts
    if (field === 'start_time' || field === 'end_time') {
      const validationError = validateSlot(updatedSlot);
      if (validationError) {
        showToast({
          type: 'error',
          message: validationError,
          duration: 4000,
        });
        // Still allow the update but show warning - user can fix it before saving
      } else {
        // Check for duplicates/overlaps with other slots
        const conflictError = checkSlotConflicts(day, index, updatedSlot);
        if (conflictError) {
          showToast({
            type: 'error',
            message: conflictError,
            duration: 4000,
          });
        }
      }
    }
    
    updatedSlots[index] = updatedSlot;
    
    setAvailabilities(prev => ({
      ...prev,
      [day]: updatedSlots,
    }));
    setHasChanges(true);
  };

  // Check for duplicates and overlaps in a day's slots
  const checkSlotConflicts = (day: string, slotIndex: number, slot: AvailabilitySlot): string | null => {
    const daySlots = availabilities[day] || [];
    
    for (let i = 0; i < daySlots.length; i++) {
      if (i === slotIndex) continue; // Skip the current slot being edited
      
      const otherSlot = daySlots[i];
      
      // Check for exact duplicates
      const isDuplicate = 
        slot.start_time === otherSlot.start_time &&
        slot.end_time === otherSlot.end_time &&
        (slot.session || 'morning') === (otherSlot.session || 'morning') &&
        (slot.is_break || false) === (otherSlot.is_break || false);
      
      if (isDuplicate) {
        const slotType = slot.is_break ? 'break' : 'availability';
        return t('common.duplicate_slot_error') || `Duplicate ${slotType} slot found`;
      }
      
      // Check for overlapping time slots
      const slotStart = timeToMinutes(slot.start_time);
      const slotEnd = timeToMinutes(slot.end_time);
      const otherStart = timeToMinutes(otherSlot.start_time);
      const otherEnd = timeToMinutes(otherSlot.end_time);
      
      const timesOverlap = (slotStart < otherEnd && slotEnd > otherStart);
      
      if (timesOverlap) {
        // Both are availability slots (not breaks) - they cannot overlap
        if (!slot.is_break && !otherSlot.is_break) {
          return t('common.availability_slot_overlap_error') || 
            `This slot overlaps with another availability slot (${otherSlot.start_time}-${otherSlot.end_time})`;
        }
        
        // Both are break slots - they cannot overlap
        if (slot.is_break && otherSlot.is_break) {
          return t('common.break_slot_overlap') || 
            `This break slot overlaps with another break slot (${otherSlot.start_time}-${otherSlot.end_time})`;
        }
      }
    }
    
    return null;
  };

  const validateSlot = (slot: AvailabilitySlot): string | null => {
    const startMinutes = timeToMinutes(slot.start_time);
    const endMinutes = timeToMinutes(slot.end_time);
    const minMinutes = 8 * 60; // 08:00
    const maxMinutes = 19 * 60; // 19:00
    
    if (startMinutes < minMinutes || startMinutes > maxMinutes) {
      return t('common.time_range_error') || 'Start time must be between 08:00 and 19:00';
    }
    
    if (endMinutes < minMinutes || endMinutes > maxMinutes) {
      return t('common.time_range_error') || 'End time must be between 08:00 and 19:00';
    }
    
    if (slot.start_time >= slot.end_time) {
      return t('common.end_time_after_start');
    }

    // Validate session type matches time range
    const session = slot.session || 'morning';
    const noonMinutes = 12 * 60; // 12:00 PM (noon)
    
    if (session === 'morning') {
      // Morning session should end before or at 12:00 PM
      if (endMinutes > noonMinutes) {
        return t('common.morning_session_must_end_before_noon') || 'Morning session must end before or at 12:00 PM';
      }
    } else if (session === 'afternoon') {
      // Afternoon session should start after 12:00 PM
      if (startMinutes <= noonMinutes) {
        return t('common.afternoon_session_must_start_after_noon') || 'Afternoon session must start after 12:00 PM';
      }
    } else if (session === 'noon') {
      // Noon session should include 12:00 PM (start before or at noon, end after noon)
      if (startMinutes > noonMinutes || endMinutes <= noonMinutes) {
        return t('common.noon_session_must_include_noon') || 'Noon session must include 12:00 PM (start before or at noon, end after noon)';
      }
    }
    
    return null;
  };

  const handleSave = async () => {
    const daySlots = availabilities[selectedDay] || [];
    
    // Validate all slots
    for (const slot of daySlots) {
      const error = validateSlot(slot);
      if (error) {
        showToast({
          type: 'error',
          message: error,
        });
        return;
      }
    }

    // Check for exact duplicates (same start_time, end_time, session, and is_break)
    for (let i = 0; i < daySlots.length; i++) {
      for (let j = i + 1; j < daySlots.length; j++) {
        const slot1 = daySlots[i];
        const slot2 = daySlots[j];
        
        const isDuplicate = 
          slot1.start_time === slot2.start_time &&
          slot1.end_time === slot2.end_time &&
          (slot1.session || 'morning') === (slot2.session || 'morning') &&
          (slot1.is_break || false) === (slot2.is_break || false);
        
        if (isDuplicate) {
          const slotType = slot1.is_break ? 'break' : 'availability';
          showToast({
            type: 'error',
            message: t('common.duplicate_slot_error') || `Duplicate ${slotType} slot found: ${slot1.start_time} - ${slot1.end_time}`,
            duration: 5000,
          });
          return;
        }
      }
    }

    // Check for overlapping time slots
    for (let i = 0; i < daySlots.length; i++) {
      for (let j = i + 1; j < daySlots.length; j++) {
        const slot1 = daySlots[i];
        const slot2 = daySlots[j];
        
        const slot1Start = timeToMinutes(slot1.start_time);
        const slot1End = timeToMinutes(slot1.end_time);
        const slot2Start = timeToMinutes(slot2.start_time);
        const slot2End = timeToMinutes(slot2.end_time);
        
        // Check if times overlap (excluding exact boundaries for adjacent slots)
        const timesOverlap = (slot1Start < slot2End && slot1End > slot2Start);
        
        if (timesOverlap) {
          // Both are availability slots (not breaks) - they cannot overlap
          if (!slot1.is_break && !slot2.is_break) {
            showToast({
              type: 'error',
              message: t('common.availability_slot_overlap_error') || 
                `Availability slots overlap: ${slot1.start_time}-${slot1.end_time} and ${slot2.start_time}-${slot2.end_time}`,
              duration: 5000,
            });
            return;
          }
          
          // Both are break slots - they cannot overlap
          if (slot1.is_break && slot2.is_break) {
            showToast({
              type: 'error',
              message: t('common.break_slot_overlap') || 
                `Break slots overlap: ${slot1.start_time}-${slot1.end_time} and ${slot2.start_time}-${slot2.end_time}`,
              duration: 5000,
            });
            return;
          }
          
          // Break overlapping with availability - this is allowed, but we can warn if needed
          // (Currently allowing this as breaks are meant to be within availability slots)
        }
      }
    }

    setIsSaving(true);
    
    try {
      // Save all slots for the selected day
      const savePromises = daySlots.map(async (slot) => {
        const payload = {
          day_of_week: slot.day_of_week,
          start_time: slot.start_time + ':00',
          end_time: slot.end_time + ':00',
          is_break: slot.is_break || false,
          session: slot.session || 'morning',
        };
        
        if (slot.uuid) {
          // Update existing slot
          return axios.put(route('availability.update', { uuid: slot.uuid }), payload);
        } else {
          // Create new slot
          return axios.post(route('availability.store'), payload);
        }
      });

      await Promise.all(savePromises);
      
      showToast({
        type: 'success',
        message: t('common.availability_saved'),
      });
      
      setHasChanges(false);
      await fetchAvailability();
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      let errorMessage = t('common.error_saving_availability');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      }
      
      showToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchAvailability();
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
              {/* Day Selector */}
              <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => {
                      if (hasChanges) {
                        confirm({
                          title: t('common.unsaved_changes'),
                          message: t('common.unsaved_changes_message') || 'You have unsaved changes. Are you sure you want to switch days?',
                          confirmLabel: t('common.discard'),
                          cancelLabel: t('common.cancel'),
                          confirmVariant: 'danger'
                        }).then((confirmed) => {
                          if (confirmed) {
                            setSelectedDay(day.value);
                            setHasChanges(false);
                            fetchAvailability();
                          }
                        });
                      } else {
                        setSelectedDay(day.value);
                        // Ensure selected day has at least one empty slot
                        const daySlots = availabilities[day.value] || [];
                        if (daySlots.length === 0) {
                          setAvailabilities(prev => ({
                            ...prev,
                            [day.value]: [{
                              day_of_week: day.value,
                              start_time: '09:00',
                              end_time: '17:00',
                              is_break: false,
                              session: 'morning',
                            }],
                          }));
                        }
                      }
                    }}
                    className={`px-5 py-2.5 font-medium text-sm transition-colors rounded-lg ${
                      selectedDay === day.value
                        ? 'bg-primary-600 text-white dark:bg-primary-500'
                        : 'bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {t(day.labelKey)}
                  </button>
                ))}
              </div>

              {/* Form Repeater Table */}
              <div className="border border-gray-200 dark:border-dark-700 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 py-3">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('common.session')}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('common.from')}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('common.to')}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('common.actions')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white dark:bg-dark-800">
                  {(availabilities[selectedDay] || []).map((slot, index) => (
                      <div
                        key={slot.uuid || `new-${index}`}
                        className="border-b border-gray-200 dark:border-dark-700 px-4 py-4 last:border-b-0"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Session Dropdown */}
                          <div className="col-span-3">
                            <div className="relative">
                              <select
                                value={slot.session || 'morning'}
                                onChange={(e) => handleUpdateSlot(selectedDay, index, 'session', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none pr-8"
                              >
                                {SESSION_TYPES.map(session => (
                                  <option key={session.value} value={session.value}>
                                    {t(session.labelKey) || session.value}
                                  </option>
                                ))}
                              </select>
                              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* From Time */}
                          <div className="col-span-3">
                            <div className="relative">
                              <Timepicker
                                value={slot.start_time}
                                onChange={(dates, dateStr) => {
                                  const timeMinutes = timeToMinutes(dateStr);
                                  const minMinutes = 8 * 60;
                                  const maxMinutes = 19 * 60;
                                  if (timeMinutes >= minMinutes && timeMinutes <= maxMinutes) {
                                    handleUpdateSlot(selectedDay, index, 'start_time', dateStr);
                                  } else {
                                    showToast({
                                      type: 'error',
                                      message: t('common.time_range_error') || 'Time must be between 08:00 and 19:00',
                                    });
                                  }
                                }}
                                options={{
                                  enableTime: true,
                                  noCalendar: true,
                                  dateFormat: "H:i",
                                  time_24hr: true,
                                }}
                              />
                              <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* To Time */}
                          <div className="col-span-3">
                            <div className="relative">
                              <Timepicker
                                value={slot.end_time}
                                onChange={(dates, dateStr) => {
                                  const timeMinutes = timeToMinutes(dateStr);
                                  const minMinutes = 8 * 60;
                                  const maxMinutes = 19 * 60;
                                  if (timeMinutes >= minMinutes && timeMinutes <= maxMinutes) {
                                    handleUpdateSlot(selectedDay, index, 'end_time', dateStr);
                                  } else {
                                    showToast({
                                      type: 'error',
                                      message: t('common.time_range_error') || 'Time must be between 08:00 and 19:00',
                                    });
                                  }
                                }}
                                options={{
                                  enableTime: true,
                                  noCalendar: true,
                                  dateFormat: "H:i",
                                  time_24hr: true,
                                }}
                              />
                              <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-3 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="flat"
                              color="primary"
                              isIcon
                              className="size-8 rounded-sm"
                              onClick={() => handleAddRow(selectedDay)}
                              title={t('common.add')}
                            >
                              <PlusIcon className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="flat"
                              color="error"
                              isIcon
                              className="size-8 rounded-sm"
                              onClick={() => handleDeleteRow(selectedDay, index)}
                              title={t('common.delete')}
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSaving || !hasChanges}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  color="primary"
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving ? t('common.saving') : t('common.save_changes')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
