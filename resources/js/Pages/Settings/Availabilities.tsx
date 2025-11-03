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
import { CalendarIcon, CheckBadgeIcon, ClockIcon, CubeIcon, CurrencyDollarIcon, PlusIcon } from "@heroicons/react/24/outline";
import { AlertCircle, BarChartIcon, Clock, TrendingUp, XCircleIcon, Zap } from "lucide-react";

export default function Availabilities() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(route('availability.getCurrentWeek'));
      if (response.data.success) {
        setStatistics(response.data);
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

  const StatisticsCards = () => {
  if (!statistics) return null;

  const cards = [
    {
      id: 1,
      title: 'Total Availability',
      value: statistics.total_slots,
      subtitle: '15-min slots',
      icon: Clock,
      color: 'from-[#4DB9AD] to-[#3A9E90]',
      textColor: 'text-[#1B2441]',
      bgColor: 'bg-[#4DB9AD]/10',
      trend: `${statistics.total_hours}h per week`,
      trendUp: true
    },
    {
      id: 2,
      title: 'Total Hours',
      value: statistics.total_hours,
      subtitle: 'hours per week',
      icon: CalendarIcon,
      color: 'from-[#1B2441] to-[#2D3E5F]',
      textColor: 'text-[#4DB9AD]',
      bgColor: 'bg-[#1B2441]/10',
      trend: 'Weekly schedule',
      trendUp: true
    },
    {
      id: 3,
      title: 'Week Coverage',
      value: `${statistics.week_coverage}%`,
      subtitle: 'of available time',
      icon: BarChartIcon,
      color: 'from-[#4DB9AD] to-[#3A9E90]',
      textColor: 'text-[#1B2441]',
      bgColor: 'bg-[#4DB9AD]/10',
      trend: statistics.week_coverage > 50 ? 'Above average' : 'Below average',
      trendUp: statistics.week_coverage > 50
    },
    {
      id: 4,
      title: 'Peak Hours',
      value: statistics.peak_hours.slots,
      subtitle: statistics.peak_hours.label,
      icon: TrendingUp,
      color: 'from-[#1B2441] to-[#2D3E5F]',
      textColor: 'text-[#4DB9AD]',
      bgColor: 'bg-[#1B2441]/10',
      trend: 'Most booked time',
      trendUp: true
    },
    {
      id: 5,
      title: 'Least Busy',
      value: statistics.least_busy_hours.slots,
      subtitle: statistics.least_busy_hours.label,
      icon: AlertCircle,
      color: 'from-orange-400 to-orange-500',
      textColor: 'text-[#1B2441]',
      bgColor: 'bg-orange-100/50',
      trend: 'Available slots',
      trendUp: false
    },
    {
      id: 6,
      title: 'Daily Average',
      value: `${statistics.daily_average}h`,
      subtitle: 'per working day',
      icon: Zap,
      color: 'from-[#4DB9AD] to-[#3A9E90]',
      textColor: 'text-[#1B2441]',
      bgColor: 'bg-[#4DB9AD]/10',
      trend: 'Consistent schedule',
      trendUp: true
    }
  ];

  return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 2xl:gap-6 mb-4">
             {cards.map(card => {
        const IconComponent = card.icon;
        return (
<div className="bg-gray-150 dark:bg-dark-700 rounded-lg p-3 2xl:p-4">
                    <div className="flex justify-between space-x-1">
                        <p className="dark:text-dark-100 text-xl font-semibold text-gray-800">
                           {card.value}
                        </p>
                        <IconComponent className="text-primary-500 size-5" />
                    </div>
                    <p className="text-xs-plus mt-1">{card.subtitle}</p>
                </div>

            ) })}
    </div>
        );
};
  return (
    <MainLayout>
      <div className="transition-content px-(--margin-x) pb-6 my-5">
           {!isLoading && statistics && <StatisticsCards />}
        <Card className="p-3 sm:px-4 hover:shadow-lg  transition-all duration-200">
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

              <style>{`
  /* General Calendar Borders */
  .calendar-container .fc {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden; /* Ensures rounded corners are applied */
  }
  .calendar-container .fc th,
  .calendar-container .fc td,
  .calendar-container .fc-scrollgrid {
    border-color: #e2e8f0; /* Light gray for all internal lines */
  }

  /* --- Day Headers --- */
  .calendar-container .fc-col-header-cell {
    background-color: #f8fafc; /* Very light bg for headers */
  }
  .calendar-container .fc-col-header-cell-cushion {
    color: #1B2441; /* Your Dark Blue */
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none !important;
    padding: 10px 4px;
  }
  
  /* --- Time Labels (Sidebar) --- */
  .calendar-container .fc-timegrid-slot-label-cushion {
    color: #374151; /* Dark Gray, less harsh than blue */
  }
  .calendar-container .fc-timegrid-slot-label {
     border-color: #e2e8f0;
  }

  /* --- Today Column --- */
  .calendar-container .fc-day-today {
    background-color: rgba(77, 185, 173, 0.05); /* Faint #4DB9AD */
  }

  /* --- Event Blocks (MODIFIED) --- */
  .calendar-container .fc-event {
    border-radius: 4px;
    font-weight: 500;
    
    /* --- THESE ARE THE CHANGES --- */
    min-height: 20px;       /* Ensures event is never too short */
    overflow: hidden;         /* Hides text that overflows */
    padding: 2px 4px;         /* Adjust padding for new height */
    font-size: 0.75rem;       /* Make text slightly smaller */
    line-height: 1.4;         /* Adjust line height */
    /* --- END OF CHANGES --- */
  }

  /* --- Selection Highlight --- */
  .calendar-container .fc-highlight {
     background-color: #4DB9AD;
     opacity: 0.2; /* More visible selection */
  }

  /* --- Hide default borders now that we have a container border --- */
  .calendar-container .fc-header-toolbar,
  .calendar-container .fc-view-harness {
    border: none;
  }

  /* --- DARK MODE STYLES (Assumes <html class="dark">) --- */
  html.dark .calendar-container .fc {
    border-color: #374151; /* Dark border */
  }
  html.dark .calendar-container .fc th,
  html.dark .calendar-container .fc td,
  html.dark .calendar-container .fc-scrollgrid {
    border-color: #374151; /* Darker internal lines */
  }

  html.dark .calendar-container .fc-col-header-cell {
    background-color: #1B2441; /* Your Dark Blue for header bg */
  }
  html.dark .calendar-container .fc-col-header-cell-cushion {
    color: #f1f5f9; /* Light text for dark header */
  }
  
  html.dark .calendar-container .fc-timegrid-slot-label-cushion {
    color: #9ca3af; /* Lighter gray for dark mode time */
  }
  html.dark .calendar-container .fc-timegrid-slot-label {
     border-color: #374151;
  }

  html.dark .calendar-container .fc-day-today {
    background-color: rgba(77, 185, 173, 0.1); /* Dark mode 'today' bg */
  }

  .calendar-container .fc{
        border:none !important;
          margin-top: -1em !important;
  }
.fc *{
  border-radius: 10px !important;
}


`}</style>

              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                firstDay={1}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="24:00:00"
                
                // --- 15 Minute Slot ---
                slotDuration="00:15:00"
                
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
                    today.setDate(today.getDate + 1); // move to Monday
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

