// Import Dependencies
import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Local Imports
import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import MainLayout from "@/layouts/MainLayout";

export default function Availabilities() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(route('availability.getCurrentWeek'));
      if (response.data.success) {
        const formattedSlots = response.data.data.map((slot: any) => ({
          id: slot.uuid,
          title: t('common.available'),
          daysOfWeek: [getDayNumber(slot.day_of_week)],
          startTime: slot.start_time,
          endTime: slot.end_time,
          startRecur: getStartOfWeek(),
          endRecur: getEndOfWeek(),
          backgroundColor: slot.is_available ? '#4DB9AD' : '#9e9e9e',
          borderColor: slot.is_available ? '#15A093' : '#9e9e9e',
          textColor: slot.is_available ? '#ffffff' : '#6b7280',
        }));
        setAvailabilitySlots(formattedSlots);
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

  const handleDateSelect = async (selectInfo: any) => {
    const title = t('common.available');
    const startTime = new Date(selectInfo.start).toTimeString().split(' ')[0];
    const endTime = new Date(selectInfo.end).toTimeString().split(' ')[0];
    const dayOfWeek = getDayName(selectInfo.start.getDay());

    try {
      const response = await axios.post(route('availability.store'), {
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      });

      if (response.data.success) {
        setAvailabilitySlots(prev => [...prev, {
          id: response.data.data.uuid,
          title,
          daysOfWeek: [selectInfo.start.getDay()],
          startTime,
          endTime,
          startRecur: getStartOfWeek(),
          endRecur: getEndOfWeek(),
          backgroundColor: '#4DB9AD',
          borderColor: '#15A093',
          textColor: '#ffffff'
        }]);
        
        showToast({
          type: 'success',
          message: t('common.availability_saved'),
        });
      }
    } catch (error) {
      console.error('Failed to save availability:', error);
      showToast({
        type: 'error',
        message: t('common.error_saving_availability'),
      });
    }
    
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = async (clickInfo: any) => {
    const confirmed = await confirm({
      title: t('common.are_you_sure'),
      message: t('common.confirm_delete_availability'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await axios.delete(route('availability.destroy', { uuid: clickInfo.event.id }));
        setAvailabilitySlots(prev =>
          prev.filter(slot => slot.id !== clickInfo.event.id)
        );
        showToast({
          type: 'success',
          message: t('common.availability_deleted'),
        });
      } catch (error) {
        console.error('Failed to delete availability:', error);
        showToast({
          type: 'error',
          message: t('common.error_deleting_availability'),
        });
      }
    }
  };

  // Helper functions
  const getDayNumber = (dayName: string): number => {
    const days: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
    return days[dayName.toLowerCase()] ?? 0;
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayNumber];
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    return firstDay.toISOString().split('T')[0];
  };

  const getEndOfWeek = () => {
    const now = new Date();
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    return lastDay.toISOString().split('T')[0];
  };

  return (
    <MainLayout>
      <div className="transition-content px-(--margin-x) pb-6 my-5">
        <Card className="p-3 sm:px-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
          <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
            {t('common.availability_management')}
          </h5>
          <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
            {t('common.set_weekly_availability')}
          </p>
          <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t('common.loading')}...
              </p>
            </div>
          ) : (
            <div className="calendar-container" style={{ height: 'auto', overflow: 'hidden' }}>
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                firstDay={1}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="24:00:00"
                height="auto"
                selectMirror={true}
                selectable={true}
                editable={false}
                events={availabilitySlots}
                select={(selectInfo) => {
                  handleDateSelect(selectInfo);
                }}
                eventClick={(clickInfo) => {
                  handleEventClick(clickInfo);
                }}
                headerToolbar={{
                  left: '',
                  center: '',
                  right: ''
                }}
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                selectAllow={(selectInfo) => {
                  return selectInfo.start >= new Date(); 
                }}
                hiddenDays={[0]} 
                initialDate={(function () {
                  const today = new Date();
                  // if today is Sunday (0), jump to next Monday
                  if (today.getDay() === 0) {
                    today.setDate(today.getDate() + 1); // move to Monday
                  }
                  return today;
                })()}
              />
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
