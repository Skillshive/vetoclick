// Import Dependencies
import {
  VideoCameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState, useEffect } from "react";

// Local Imports
import { Avatar, Badge, Box, Button } from "@/components/ui";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { t, locale } = useTranslation();
  const [canAccessMeeting, setCanAccessMeeting] = useState<boolean | null>(null);
  const [timeRemainingMessage, setTimeRemainingMessage] = useState<string | null>(null);
  const [showJoinButton, setShowJoinButton] = useState<boolean>(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const formatDate = (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
    return d.toLocaleDateString(dateLocale, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string): string => {
    // Convert time to 24-hour format (HH:mm) without seconds
    if (!time) return '';
    
    // Check if time contains AM/PM
    if (time.includes('AM') || time.includes('PM')) {
      const [timePart, period] = time.split(/(AM|PM)/i);
      const [hours, minutes] = timePart.trim().split(':');
      let hour24 = parseInt(hours, 10);
      
      if (period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Already in 24-hour format - remove seconds if present
    const timeParts = time.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0].padStart(2, '0')}:${timeParts[1]}`;
    }
    
    return time;
  };

  const getStatusColor = (status: string): "primary" | "warning" | "error" | "info" |  "secondary" => {
    switch (status) {
      case "confirmed":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "info";
      default:
        return "primary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return CheckCircleIcon;
      case "pending":
        return ClockIcon;
      case "cancelled":
        return XCircleIcon;
      case "completed":
        return CheckCircleIcon;
      default:
        return CalendarIcon;
    }
  };

  const StatusIcon = getStatusIcon(appointment.status);
  const statusColor = getStatusColor(appointment.status);

  // Calculate time remaining until meeting is available
  useEffect(() => {
    if (!appointment.is_video_conseil || !appointment.video_join_url) {
      return;
    }

    const calculateTimeRemaining = () => {
      try {
        const appointmentDate = new Date(appointment.appointment_date);
        const [startHours, startMinutes] = formatTime(appointment.start_time).split(':').map(Number);
        const [endHours, endMinutes] = formatTime(appointment.end_time).split(':').map(Number);
        
        const appointmentStartDateTime = new Date(appointmentDate);
        appointmentStartDateTime.setHours(startHours, startMinutes, 0, 0);
        
        const appointmentEndDateTime = new Date(appointmentDate);
        appointmentEndDateTime.setHours(endHours, endMinutes, 0, 0);
        
        const earliestAccess = new Date(appointmentStartDateTime.getTime() - 5 * 60 * 1000); // 5 minutes before
        const latestAccess = new Date(appointmentEndDateTime.getTime() + 30 * 60 * 1000); // 30 minutes after end time
        
        const now = new Date();
        
        if (now > latestAccess) {
          setShowJoinButton(false);
          setCanAccessMeeting(false);
          setTimeRemainingMessage(null);
          return;
        }
        
        setShowJoinButton(true);
        
        if (now < earliestAccess) {
          const diffMs = earliestAccess.getTime() - now.getTime();
          const totalMinutes = diffMs / (1000 * 60);
          
          let message: string;
          if (totalMinutes > 60) {
            const hours = Math.floor(totalMinutes / 60);
            const remainingMinutes = Math.floor(totalMinutes % 60);
            const hoursUnit = hours === 1 ? t('common.hour') || 'hour' : t('common.hours') || 'hours';
            const minutesUnit = remainingMinutes === 1 ? t('common.minute') || 'minute' : t('common.minutes') || 'minutes';
            
            if (remainingMinutes > 0) {
              message = t('common.meeting_will_be_available_in_hours_minutes', { 
                hours, 
                minutes: remainingMinutes,
                hoursUnit,
                minutesUnit
              }) || `Meeting will be available in ${hours} ${hoursUnit} ${remainingMinutes} ${minutesUnit}`;
            } else {
              message = t('common.meeting_will_be_available_in_hours', { 
                hours,
                hoursUnit
              }) || `Meeting will be available in ${hours} ${hoursUnit}`;
            }
          } else {
            const minutes = Math.floor(totalMinutes);
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            const minutesUnit = minutes === 1 ? t('common.minute') || 'minute' : t('common.minutes') || 'minutes';
            const secondsUnit = seconds === 1 ? t('common.second') || 'second' : t('common.seconds') || 'seconds';
            
            if (minutes > 0 && seconds > 0) {
              message = t('common.meeting_will_be_available_in_minutes_seconds', { 
                minutes, 
                seconds,
                minutesUnit,
                secondsUnit
              }) || `Meeting will be available in ${minutes} ${minutesUnit} ${seconds} ${secondsUnit}`;
            } else if (minutes > 0) {
              message = t('common.meeting_will_be_available_in_minutes', { 
                minutes,
                minutesUnit
              }) || `Meeting will be available in ${minutes} ${minutesUnit}`;
            } else {
              message = t('common.meeting_will_be_available_in_seconds', { 
                seconds,
                secondsUnit
              }) || `Meeting will be available in ${seconds} ${secondsUnit}`;
            }
          }
          
          setCanAccessMeeting(false);
          setTimeRemainingMessage(message);
        } else {
          if (now >= earliestAccess && now <= latestAccess) {
            setCanAccessMeeting(true);
            setTimeRemainingMessage(null);
          } else {
            setCanAccessMeeting(false);
            setTimeRemainingMessage(t('common.meeting_time_has_passed') || 'Meeting time has passed');
          }
        }
      } catch (error) {
        console.error('Error calculating time remaining:', error);
        setCanAccessMeeting(false);
      }
    };

    calculateTimeRemaining();
    
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [appointment.uuid, appointment.is_video_conseil, appointment.video_join_url, appointment.appointment_date, appointment.start_time, appointment.end_time, t]);

  const handleJoinMeeting = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (canAccessMeeting === false) {
      return;
    }

    setIsCheckingAccess(true);

    try {
      const response = await fetch(route('appointments.join-video-meeting', { uuid: appointment.uuid }), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (response.ok && response.redirected) {
        window.location.href = response.url;
      } else if (appointment.video_join_url) {
        window.location.href = appointment.video_join_url;
      } else {
        throw new Error('Meeting URL not available');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setIsCheckingAccess(false);
    }
  };

  return (
    <Box
      className=
        "border-l-primary-500 dark:border-l-primary-900/20 flex flex-col justify-between border-4 border-transparent px-4 py-5 w-80 shrink-0"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              size={10}
              name={appointment.pet?.name || "Pet"}
              src={appointment.pet?.avatar}
              classNames={{ display: "mask is-squircle rounded-lg" }}
              initialColor="auto"
            />
            <div>
              <p className="dark:text-dark-100 text-base font-medium text-gray-800">
                {appointment.pet?.name || "Pet"}
              </p>
              <p className="dark:text-dark-300 text-xs text-gray-400">
                {appointment.pet?.breed || "Unknown breed"}
              </p>
            </div>
          </div>
          <StatusIcon className={clsx(
            "size-5",
            statusColor === "primary" && "text-primary-500 dark:text-primary-400",
            statusColor === "warning" && "text-warning-600 dark:text-warning-400",
            statusColor === "error" && "text-error-600 dark:text-error-400",
            statusColor === "info" && "text-info-600 dark:text-info-400",
            statusColor === "secondary" && "text-gray-500 dark:text-gray-400",
          )} />
        </div>
        
        <p className="dark:text-dark-100 text-sm font-semibold text-gray-800 mb-1">
          {t(appointment.appointment_type)}
        </p>
        {appointment.reason_for_visit ?  (
          <p className="dark:text-dark-300 text-xs text-gray-400 mb-3 line-clamp-2">
            {appointment.reason_for_visit}
          </p>
        ) :null}
        
        <Badge color={statusColor} variant="outlined" className="mt-2">
          {appointment.status}
        </Badge>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-gray-400 dark:text-dark-300" />
          <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
            {formatDate(appointment.appointment_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-gray-400 dark:text-dark-300" />
          <p className="dark:text-dark-300 text-xs text-gray-600">
            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
          </p>
        </div>
      </div>

      {(appointment.is_video_conseil && showJoinButton && appointment.video_join_url && appointment.status === 'confirmed') ? (
        <div className="mt-6">
          <Button
            color="primary"
            className="w-full"
            onClick={handleJoinMeeting}
            disabled={isCheckingAccess || canAccessMeeting === false}
          >
            <VideoCameraIcon className="size-4 mr-2" />
            {isCheckingAccess 
              ? (t("common.checking") || "Checking...")
              : (t("common.vet_dashboard.appointment_card.join_video_call") || "Join Video Call")}
          </Button>
          {canAccessMeeting === false && timeRemainingMessage && (
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-300 text-center">
              {timeRemainingMessage}
            </p>
          )}
        </div>
      ) : null}
    </Box>
  );
}

