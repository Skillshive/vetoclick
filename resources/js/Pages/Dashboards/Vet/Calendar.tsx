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
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { enUS, fr, ar } from 'date-fns/locale';
import type { Locale } from 'date-fns';
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
  
  // Get date-fns locale based on current locale
  const getDateFnsLocale = () => {
    const baseLocale = locale?.split('-')[0]?.toLowerCase() || 'en';
    const localeMap: Record<string, Locale> = {
      'ar': ar,
      'en': enUS,
      'fr': fr,
    };
    return localeMap[baseLocale] || localeMap[locale?.toLowerCase() || ''] || enUS;
  };
  
  const dateFnsLocale = getDateFnsLocale();
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
        // Process events to apply primary colors based on status
        const processedEvents = response.data.events.map((event: CalendarEvent) => {
          const status = event.extendedProps?.status;
          
          // Helper to get CSS variable color value
          const getCSSVariableColor = (variableName: string, fallback: string = 'rgb(77, 185, 173)') => {
            if (typeof window !== 'undefined') {
              const root = document.documentElement;
              const colorValue = getComputedStyle(root).getPropertyValue(variableName).trim();
              if (colorValue) {
                // If it's already in rgb format, return as is
                if (colorValue.startsWith('rgb')) {
                  return colorValue;
                }
                // If it's just numbers (RGB values), format as rgb()
                if (/^\d+\s+\d+\s+\d+$/.test(colorValue)) {
                  return `rgb(${colorValue})`;
                }
                return colorValue;
              }
            }
            return fallback;
          };

          // Override colors based on status
          if (status === 'completed') {
            const primaryColor = getCSSVariableColor('--color-primary', 'rgb(77, 185, 173)');
            return {
              ...event,
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            };
          } else if (status === 'confirmed' || status === 'scheduled') {
            const primary500Color = getCSSVariableColor('--color-primary-500', 'rgb(77, 185, 173)');
            return {
              ...event,
              backgroundColor: primary500Color,
              borderColor: primary500Color,
            };
          }
          
          // Handle backend color strings like 'primary' or 'primary-500'
          if (event.backgroundColor === 'primary') {
            const primaryColor = getCSSVariableColor('--color-primary', 'rgb(77, 185, 173)');
            return {
              ...event,
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            };
          } else if (event.backgroundColor === 'primary-500') {
            const primary500Color = getCSSVariableColor('--color-primary-500', 'rgb(77, 185, 173)');
            return {
              ...event,
              backgroundColor: primary500Color,
              borderColor: primary500Color,
            };
          }
          
          return event;
        });
        
        setEvents(processedEvents);
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
      return format(view.activeStart, 'MMMM yyyy', { locale: dateFnsLocale }).toUpperCase();
    } else if (currentView === 'timeGridWeek') {
      const start = format(view.activeStart, 'MMM d', { locale: dateFnsLocale });
      const end = format(view.activeEnd, 'MMM d, yyyy', { locale: dateFnsLocale });
      return `${start} - ${end}`;
    } else {
      return format(view.activeStart, 'EEEE, MMMM d, yyyy', { locale: dateFnsLocale });
    }
  };

  const formatMonthYear = () => {
    if (!calendarRef.current) return '';
    const api = calendarRef.current.getApi();
    const view = api.view;
    return format(view.activeStart, 'MMMM yyyy', { locale: dateFnsLocale }).toUpperCase();
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
                  background-color: rgb(var(--color-primary) / 0.05) !important;
                }

                html.dark .calendar-container .fc-day-today {
                  background-color: rgb(var(--color-primary) / 0.1) !important;
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
                  background-color: rgb(var(--color-primary) / 0.15);
                  border: 1px dashed rgb(var(--color-primary));
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
                  color: rgb(var(--color-primary));
                  font-weight: 500;
                  font-size: 0.75rem;
                }

                .calendar-container .fc-more-link:hover {
                  color: rgb(var(--color-primary));
                }

                /* Button Styling */
                .calendar-container .fc-button {
                  background-color: rgb(var(--color-primary));
                  border-color: rgb(var(--color-primary));
                  color: white;
                  font-weight: 500;
                  padding: 6px 12px;
                  border-radius: 6px;
                  transition: all 0.2s ease;
                }

                .calendar-container .fc-button:hover {
                  background-color: rgb(var(--color-primary));
                  border-color: rgb(var(--color-primary));
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
                  background-color: rgb(var(--color-primary));
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
                  hour12: false,
                }}
              />
            </div>
          </Card>

          {/* Event Modal */}
          <Transition show={showEventModal}>
            <Dialog as="div" className="relative z-50" onClose={() => setShowEventModal(false)}>
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
                      {selectedEvent ? (() => {
                        const now = new Date();
                        const startTime = new Date(selectedEvent.start);
                        const endTime = new Date(selectedEvent.end);
                        const isDuringMeeting = now >= startTime && now <= endTime;
                        
                        return (
                          <>
                            <DialogTitle className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {selectedEvent.title}
                                </h3>
                                {selectedEvent.extendedProps.pet?.species ? (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedEvent.extendedProps.pet.species}
                                  </p>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowEventModal(false)}
                                className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                              >
                                <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              </button>
                            </DialogTitle>

                            <div className="space-y-4">
                              {/* Date & Time */}
                              <div className="flex items-center gap-2 text-base">
                                <ClockIcon className="size-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy', { locale: dateFnsLocale })}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                  {format(new Date(selectedEvent.start), 'HH:mm')} - {format(new Date(selectedEvent.end), 'HH:mm')}
                                </span>
                              </div>

                              {/* Client */}
                              {selectedEvent.extendedProps.client ? (
                                <div className="flex items-center gap-2 text-base">
                                  <UserIcon className="size-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">{t('common.client')}:</span>
                                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{selectedEvent.extendedProps.client.name}</span>
                                </div>
                              ) : null}

                              {/* Appointment Type & Status */}
                              <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200 dark:border-dark-500">
                                {selectedEvent.extendedProps.appointment_type ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t('common.appointment_type')}:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                      {translateAppointmentType(selectedEvent.extendedProps.appointment_type)}
                                    </span>
                                  </div>
                                ) : null}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {selectedEvent.extendedProps.status ? (
                                    <Badge color={getStatusColor(selectedEvent.extendedProps.status)}>
                                      {translateStatus(selectedEvent.extendedProps.status)}
                                    </Badge>
                                  ) : null}
                                  {selectedEvent.extendedProps.is_video ? (
                                    <Badge color="info" className="flex items-center gap-1">
                                      <VideoCameraIcon className="size-3" />
                                      {t('common.video_consultation')}
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>

                              {/* Reason for Visit */}
                              {selectedEvent.extendedProps.reason ? (
                                <div className="pt-2 border-t border-gray-200 dark:border-dark-500">
                                  <span className="text-gray-600 dark:text-gray-400 text-sm block mb-2">{t('common.reason_for_visit')}</span>
                                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{selectedEvent.extendedProps.reason}</p>
                                </div>
                              ) : null}

                              {/* Video Meeting Link - Only show during appointment time */}
                              {selectedEvent.extendedProps.is_video && selectedEvent.extendedProps.video_join_url && isDuringMeeting ? (
                                <div className="pt-2 border-t border-gray-200 dark:border-dark-500">
                                  <a
                                    href={selectedEvent.extendedProps.video_join_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline font-semibold"
                                  >
                                    <VideoCameraIcon className="size-5" />
                                    {t('common.join_video_meeting')}
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          </>
                        );
                      })() : null}
                    </DialogPanel>
                  </TransitionChild>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </Page>
    </MainLayout>
  );
}

