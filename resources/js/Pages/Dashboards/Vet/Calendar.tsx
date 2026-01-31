import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, Button, Badge } from '@/components/ui';
import MainLayout from '@/layouts/MainLayout';
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';
import { useRTL } from '@/hooks/useRTL';
import { router } from '@inertiajs/react';
// @ts-ignore - Modal.jsx doesn't have TypeScript definitions
import Modal from '@/Components/Modal';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import axios from 'axios';
import allLocales from '@fullcalendar/core/locales-all';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    appointment_type: string;
    reason: string;
    appointment_notes?: string;
    status: string;
    is_video: boolean;
    duration_minutes?: number | null;
    video_meeting_id?: string;
    video_join_url?: string;
    appointment_date?: string;
    start_time?: string;
    end_time?: string;
    client: {
      name: string;
      uuid: string;
    } | null;
    pet: {
      name: string;
      uuid: string;
      breed?: string;
      species?: string;
      microchip?: string;
      color?: string;
      weight_kg?: number | null;
      dob?: string;
    } | null;
    consultation: {
      uuid: string;
      status: string;
    } | null;
  };
}

interface CalendarProps {
  events?: CalendarEvent[];
  error?: string;
}

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

export default function Calendar({ events: initialEvents = [], error: initialError }: CalendarProps) {
  const { t, locale } = useTranslation();
  const { isRtl, rtlClasses } = useRTL();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Map locale codes to FullCalendar locale codes
  const getFullCalendarLocale = () => {
    const localeMap: Record<string, string> = {
      'ar': 'ar',
      'en': 'en',
      'fr': 'fr',
    };
    
    // Get base locale (e.g., 'en' from 'en-US')
    const baseLocale = locale?.split('-')[0]?.toLowerCase() || 'en';
    return localeMap[baseLocale] || localeMap[locale?.toLowerCase() || ''] || 'en';
  };
  
  const calendarLocale = getFullCalendarLocale();
  const [currentView, setCurrentView] = useState<ViewType>('timeGridWeek');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, currentView]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const view = calendarApi.view;
      const start = view.activeStart.toISOString().split('T')[0];
      const end = view.activeEnd.toISOString().split('T')[0];

      const response = await axios.get(route('appointments.calendar'), {
        params: { start, end },
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.data.events) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
      setCurrentDate(new Date());
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;
    
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: extendedProps,
    });
    setShowEventModal(true);
  };

  const handleDateChange = () => {
    if (calendarRef.current) {
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
      case 'canceled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Helper function to translate appointment types
  const translateAppointmentType = (type: string | null | undefined): string => {
    if (!type || type === '0') return 'N/A';
    
    // Convert to string if it's a number
    const typeStr = String(type).trim();
    if (!typeStr) return 'N/A';
    
    // If it's already a translation key (starts with 'common.')
    if (typeStr.startsWith('common.')) {
      const translated = t(typeStr);
      if (translated && translated !== typeStr && translated !== 'common.' + typeStr.replace('common.', '')) {
        return translated;
      }
      return typeStr.replace('common.', '').split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    // Handle common appointment types with mapping
    const typeMap: Record<string, string> = {
      'vaccination': 'common.vaccination',
      'checkup': 'common.checkup',
      'check-up': 'common.checkup',
      'surgery_consult': 'common.surgery_consult',
      'surgery consult': 'common.surgery_consult',
      'new_patient': 'common.new_patient',
      'new patient': 'common.new_patient',
      'other': 'common.other',
    };
    
    const normalizedType = typeStr.toLowerCase().trim();
    const translationKey = typeMap[normalizedType] || `common.${normalizedType.replace(/\s+/g, '_')}`;
    const translated = t(translationKey);
    
    // If translation exists and is different from the key, use it
    if (translated && translated !== translationKey && translated !== `common.${normalizedType}`) {
      return translated;
    }
    
    // Fallback: capitalize first letter of each word
    return typeStr.split(/[_\s]+/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Helper function to translate status
  const translateStatus = (status: string | null | undefined): string => {
    if (!status || status === '0') return 'Unknown';
    
    // Convert to string if it's a number
    const statusStr = String(status).trim();
    if (!statusStr) return 'Unknown';
    
    const translationKey = `common.${statusStr.toLowerCase()}`;
    const translated = t(translationKey);
    
    // Only return translated if it's actually different from the key
    if (translated && translated !== translationKey && translated !== `common.${statusStr.toLowerCase()}`) {
      return translated;
    }
    
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 2:
        return <Badge variant="warning">{t('common.in_progress')}</Badge>;
      case 1:
        return <Badge variant="success">{t('common.completed')}</Badge>;
      case 3:
        return <Badge variant="error">{t('common.cancelled')}</Badge>;
      default:
        return null;
    }
  };

  const formatDateRange = () => {
    if (!calendarRef.current) return '';
    const api = calendarRef.current.getApi();
    const view = api.view;
    
    if (currentView === 'dayGridMonth') {
      return format(view.activeStart, 'MMMM yyyy').toUpperCase();
    } else if (currentView === 'timeGridWeek') {
      const start = format(view.activeStart, 'MMM d');
      const end = format(view.activeEnd, 'MMM d, yyyy');
      return `${start} - ${end}`;
    } else {
      return format(view.activeStart, 'EEEE, MMMM d, yyyy');
    }
  };

  const formatMonthYear = () => {
    if (!calendarRef.current) return '';
    const api = calendarRef.current.getApi();
    const view = api.view;
    return format(view.activeStart, 'MMMM yyyy').toUpperCase();
  };

  return (
    <MainLayout>
      <Page title={t('common.calendar') || 'Calendar'}>
        <div className="transition-content px-(--margin-x) pb-6 mt-4">
          {/* Calendar Header - Matching Image Design */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Left Side: Today Button and Navigation */}
            <div className={`flex items-center gap-2 ${isRtl ? rtlClasses.flexRowReverse : rtlClasses.flexRow}`}>
              {/* Today Button */}
              <button
                onClick={handleToday}
                className="px-4 h-9 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                {t('common.today') || 'Today'}
              </button>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  aria-label={isRtl ? 'Next' : 'Previous'}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {isRtl ? (
                    <ChevronRightIcon className="size-5" />
                  ) : (
                    <ChevronLeftIcon className="size-5" />
                  )}
                </button>
                <button
                  onClick={handleNext}
                  aria-label={isRtl ? 'Previous' : 'Next'}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {isRtl ? (
                    <ChevronLeftIcon className="size-5" />
                  ) : (
                    <ChevronRightIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Center: Month/Year Display */}
            <div className="flex-1 flex justify-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {formatMonthYear()}
              </h2>
            </div>

            {/* Right Side: View Buttons and Settings */}
            <div className={`flex items-center gap-2 ${isRtl ? rtlClasses.flexRowReverse : rtlClasses.flexRow}`}>
              {/* View Toggle Buttons */}
              <div className={`flex items-center gap-1 bg-gray-100 dark:bg-dark-700 rounded-lg p-1 ${isRtl ? rtlClasses.flexRowReverse : rtlClasses.flexRow}`}>
                <button
                  onClick={() => handleViewChange('dayGridMonth')}
                  className={`px-3 h-8 rounded-md text-xs font-medium transition-colors ${
                    currentView === 'dayGridMonth'
                      ? 'bg-primary-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {t('common.month') || 'Month'}
                </button>
                <button
                  onClick={() => handleViewChange('timeGridWeek')}
                  className={`px-3 h-8 rounded-md text-xs font-medium transition-colors ${
                    currentView === 'timeGridWeek'
                      ? 'bg-primary-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {t('common.week') || 'Week'}
                </button>
                <button
                  onClick={() => handleViewChange('timeGridDay')}
                  className={`px-3 h-8 rounded-md text-xs font-medium transition-colors ${
                    currentView === 'timeGridDay'
                      ? 'bg-primary-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {t('common.day') || 'Day'}
                </button>
              </div>

            
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Calendar */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
            <div className="calendar-container">
              <style>{`
                /* Modern Google Calendar-like Styling */
                .calendar-container .fc {
                  border: none;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }

                /* Header Toolbar - Hidden (we use custom controls) */
                .calendar-container .fc-header-toolbar {
                  display: none;
                }

                /* Column Headers */
                .calendar-container .fc-col-header-cell {
                  background-color: #f8fafc;
                  border-color: #e2e8f0;
                  padding: 12px 8px;
                }

                html.dark .calendar-container .fc-col-header-cell {
                  background-color: #1f2937;
                  border-color: #374151;
                }

                .calendar-container .fc-col-header-cell-cushion {
                  color: #1f2937;
                  font-weight: 600;
                  font-size: 0.875rem;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }

                html.dark .calendar-container .fc-col-header-cell-cushion {
                  color: #f3f4f6;
                }

                /* Time Grid Labels */
                .calendar-container .fc-timegrid-slot-label {
                  border-color: #e2e8f0;
                  font-size: 0.75rem;
                  color: #6b7280;
                  padding: 4px 8px;
                }

                html.dark .calendar-container .fc-timegrid-slot-label {
                  border-color: #374151;
                  color: #9ca3af;
                }

                .calendar-container .fc-timegrid-slot-label-cushion {
                  color: #6b7280;
                }

                html.dark .calendar-container .fc-timegrid-slot-label-cushion {
                  color: #9ca3af;
                }

                /* Day Cells */
                .calendar-container .fc-daygrid-day {
                  border-color: #e2e8f0;
                }

                html.dark .calendar-container .fc-daygrid-day {
                  border-color: #374151;
                }

                .calendar-container .fc-daygrid-day-frame {
                  min-height: 100px;
                }

                /* Today Highlight */
                .calendar-container .fc-day-today {
                  background-color: rgba(77, 185, 173, 0.05) !important;
                }

                html.dark .calendar-container .fc-day-today {
                  background-color: rgba(77, 185, 173, 0.1) !important;
                }

                /* Events */
                .calendar-container .fc-event {
                  border: none;
                  border-radius: 4px;
                  padding: 2px 6px;
                  font-size: 0.75rem;
                  font-weight: 500;
                  cursor: pointer;
                  transition: all 0.2s ease;
                }

                .calendar-container .fc-event:hover {
                  opacity: 0.9;
                  transform: translateY(-1px);
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .calendar-container .fc-event-title {
                  font-weight: 500;
                  padding: 0;
                }

                /* Time Grid Events */
                .calendar-container .fc-timegrid-event {
                  border-radius: 4px;
                  padding: 2px 4px;
                }

                .calendar-container .fc-timegrid-event-short .fc-event-time {
                  display: none;
                }

                /* Month View Events */
                .calendar-container .fc-daygrid-event {
                  margin: 1px 2px;
                }

                /* Selection */
                .calendar-container .fc-highlight {
                  background-color: rgba(77, 185, 173, 0.15);
                  border: 1px dashed #4DB9AD;
                }

                /* Scrollbar */
                .calendar-container .fc-scroller {
                  scrollbar-width: thin;
                  scrollbar-color: #cbd5e1 #f1f5f9;
                }

                html.dark .calendar-container .fc-scroller {
                  scrollbar-color: #4b5563 #1f2937;
                }

                /* More Link */
                .calendar-container .fc-more-link {
                  color: #4DB9AD;
                  font-weight: 500;
                  font-size: 0.75rem;
                }

                .calendar-container .fc-more-link:hover {
                  color: #15A093;
                }

                /* Button Styling */
                .calendar-container .fc-button {
                  background-color: #4DB9AD;
                  border-color: #4DB9AD;
                  color: white;
                  font-weight: 500;
                  padding: 6px 12px;
                  border-radius: 6px;
                  transition: all 0.2s ease;
                }

                .calendar-container .fc-button:hover {
                  background-color: #15A093;
                  border-color: #15A093;
                }

                .calendar-container .fc-button:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }

                /* Day Grid Number */
                .calendar-container .fc-daygrid-day-number {
                  padding: 8px;
                  color: #1f2937;
                  font-weight: 500;
                }

                html.dark .calendar-container .fc-daygrid-day-number {
                  color: #f3f4f6;
                }

                .calendar-container .fc-day-today .fc-daygrid-day-number {
                  background-color: #4DB9AD;
                  color: white;
                  border-radius: 50%;
                  width: 28px;
                  height: 28px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 4px;
                }
              `}</style>

              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                events={events}
                eventClick={handleEventClick}
                datesSet={handleDateChange}
                headerToolbar={false}
                height="auto"
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="19:00:00"
                slotDuration="00:30:00"
                firstDay={isRtl ? 6 : 1}
                locale={calendarLocale}
                locales={allLocales}
                direction={isRtl ? 'rtl' : 'ltr'}
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }}
              />
            </div>
          </Card>

          {/* Event Modal */}
          <Modal
            show={showEventModal}
            maxWidth="2xl"
            closeable={true}
            onClose={() => setShowEventModal(false)}
          >
            {selectedEvent && (
              <>
                <div className="border-b border-gray-200 dark:border-dark-500 px-6 py-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {selectedEvent.title}
                    </h3>
                    {selectedEvent.extendedProps.pet?.species && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedEvent.extendedProps.pet.species}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                    <ClockIcon className="size-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.date_time') || 'Date & Time'}</p>
                      <p className="text-base text-gray-800 dark:text-gray-200">
                        {format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(selectedEvent.start), 'h:mm a')} - {format(new Date(selectedEvent.end), 'h:mm a')}
                        {selectedEvent.extendedProps.duration_minutes && selectedEvent.extendedProps.duration_minutes > 0 && (
                          <span className="ml-2">({selectedEvent.extendedProps.duration_minutes} {t('common.minutes') || 'min'})</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Client Information */}
                  {selectedEvent.extendedProps.client && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                      <UserIcon className="size-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.client') || 'Client'}</p>
                        <p className="text-base text-gray-800 dark:text-gray-200">
                          {selectedEvent.extendedProps.client.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pet Information */}
                  {selectedEvent.extendedProps.pet && (
                    <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('common.pet_information') || 'Pet Information'}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">{t('common.name') || 'Name'}</p>
                          <a onClick={() => {
                        router.visit(route('pets.show', selectedEvent.extendedProps.pet?.uuid));
                        setShowEventModal(false);
                      }} className="text-gray-800 dark:text-gray-200 font-medium hover:underline cursor-pointer">{selectedEvent.extendedProps.pet.name}</a>
                        </div>
                        {selectedEvent.extendedProps.pet.species && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('common.species') || 'Species'}</p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedEvent.extendedProps.pet.species}</p>
                          </div>
                        )}
                        {selectedEvent.extendedProps.pet.breed && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('common.breed') || 'Breed'}</p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedEvent.extendedProps.pet.breed}</p>
                          </div>
                        )}
                        {selectedEvent.extendedProps.pet.microchip && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('common.microchip') || 'Microchip'}</p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                              {selectedEvent.extendedProps.pet.microchip !== 'common.microchip' 
                                ? selectedEvent.extendedProps.pet.microchip 
                                : 'N/A'}
                            </p>
                          </div>
                        )}
                        {selectedEvent.extendedProps.pet.weight_kg && selectedEvent.extendedProps.pet.weight_kg > 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('common.weight') || 'Weight'}</p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedEvent.extendedProps.pet.weight_kg} kg</p>
                          </div>
                        )}
                        {selectedEvent.extendedProps.pet.color && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('common.color') || 'Color'}</p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedEvent.extendedProps.pet.color}</p>
                          </div>
                        )}
                        {selectedEvent.extendedProps.pet.dob && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">{t('common.date_of_birth') || 'Date of Birth'}</p>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">
                              {format(new Date(selectedEvent.extendedProps.pet.dob), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appointment Type & Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.appointment_type') || 'Appointment Type'}</p>
                      <p className="text-base text-gray-800 dark:text-gray-200">
                        {selectedEvent.extendedProps.appointment_type 
                          ? translateAppointmentType(selectedEvent.extendedProps.appointment_type)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedEvent.extendedProps.status  ? (
                        <Badge color={getStatusColor(selectedEvent.extendedProps.status)}>
                          {translateStatus(selectedEvent.extendedProps.status)}
                        </Badge>
                      ) : null}
                      {selectedEvent.extendedProps.is_video  ? (
                        <Badge color="info" className="flex items-center gap-1">
                          <VideoCameraIcon className="size-3" />
                          {t('common.video_consultation') || 'Video Consultation'}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  {selectedEvent.extendedProps.reason  ? (
                    <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.reason_for_visit') || 'Reason for Visit'}</p>
                      <p className="text-base text-gray-800 dark:text-gray-200">
                        {selectedEvent.extendedProps.reason}
                      </p>
                    </div>
                  ) : null}

                  {/* Appointment Notes */}
                  {selectedEvent.extendedProps.appointment_notes  ? (
                    <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.appointment_notes') || 'Appointment Notes'}</p>
                      <p className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selectedEvent.extendedProps.appointment_notes}
                      </p>
                    </div>
                  ) : null}

                  {/* Consultation Status
                  {selectedEvent.extendedProps.consultation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t('common.consultation') || 'Consultation'}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {t('common.status') || 'Status'}: <span className="font-medium">
                          {getStatusBadge(selectedEvent.extendedProps.consultation.status)}
                        </span>
                      </p>
                    </div>
                  )} */}

                  {/* Video Meeting Link */}
                  {selectedEvent.extendedProps.is_video && selectedEvent.extendedProps.video_join_url  ? (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">{t('common.video_meeting') || 'Video Meeting'}</p>
                      <a
                        href={selectedEvent.extendedProps.video_join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-2"
                      >
                        <VideoCameraIcon className="size-4" />
                        {t('common.join_video_meeting') || 'Join Video Meeting'}
                      </a>
                    </div>
                  ) : null}

                  {/* Action Buttons
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-500">
                    <Button
                      variant="filled"
                      color="primary"
                      onClick={() => {
                        router.visit(route('appointments.index'));
                        setShowEventModal(false);
                      }}
                      className="flex-1"
                    >
                      {t('common.view_full_details') || 'View Full Details'}
                    </Button>
                    {selectedEvent.extendedProps.pet?.uuid && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                        router.visit(route('pets.show', selectedEvent.extendedProps.pet.uuid));
                        setShowEventModal(false);
                      }}
                      className="flex-1"
                    >
                      {t('common.view_pet_profile') || 'View Pet Profile'}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => setShowEventModal(false)}
                    >
                      {t('common.close') || 'Close'}
                    </Button>
                  </div> */}
                </div>
              </>
            )}
          </Modal>
        </div>
      </Page>
    </MainLayout>
  );
}

