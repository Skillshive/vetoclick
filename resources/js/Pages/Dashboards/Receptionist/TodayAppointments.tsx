import { Appointment } from "@/pages/Appointments/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, Badge, Box, Pagination } from "@/components/ui";
import { 
  VideoCameraIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState, useMemo } from "react";

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

export function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sort appointments by status priority and time
  const sortedAppointments = useMemo(() => {
    const statusPriority: Record<string, number> = {
      'scheduled': 1,
      'confirmed': 2,
      'completed': 3,
      'cancelled': 4,
    };

    return [...appointments].sort((a, b) => {
      // First, sort by status priority
      const statusA = statusPriority[a.status] || 999;
      const statusB = statusPriority[b.status] || 999;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // Then sort by time
      const timeA = a.start_time || '';
      const timeB = b.start_time || '';
      return timeA.localeCompare(timeB);
    });
  }, [appointments]);

  // Paginate appointments
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAppointments.slice(startIndex, endIndex);
  }, [sortedAppointments, currentPage]);

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);

  const getStatusColor = (status: string): "primary" | "success" | "error" | "secondary" | "info" | "neutral" | "warning" => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('common.confirmed') || 'Confirmed';
      case 'scheduled':
        return t('common.scheduled') || 'Scheduled';
      case 'completed':
        return t('common.completed') || 'Completed';
      case 'cancelled':
        return t('common.cancelled') || 'Cancelled';
      default:
        return status;
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return <ClockIcon className="size-5 text-primary-500" />;
      case "completed":
        return <CheckBadgeIcon className="size-5 text-success-500" />;
      case "cancelled":
        return <XCircleIcon className="size-5 text-error-500" />;
      default:
        return <ClockIcon className="size-5 text-gray-400" />;
    }
  };

  return (
    <div className="mt-4 sm:mt-5 lg:mt-6">
      <div className="flex h-8 items-center justify-between">
        <h2 className="dark:text-dark-100 text-base font-medium tracking-wide text-gray-800">
          {t("common.todays_schedule") || "Today's Schedule"}
        </h2>
        <span className="text-xs-plus text-gray-500 dark:text-gray-400">
          {appointments.length} {t("common.appointments") || "appointments"}
        </span>
      </div>

      {appointments.length === 0 ? (
        <Box className="mt-3 p-12 text-center">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-100">
            {t("common.no_appointments_today") || "No appointments today"}
          </h3>
        </Box>
      ) : (
        <>
          <div className="mt-3 space-y-3">
            {paginatedAppointments.map((appointment) => {
              const statusColor = getStatusColor(appointment.status);
              
              return (
                <Box
                  key={appointment.uuid}
                  className={clsx(
                    `this:${statusColor}`,
                    "border-l-this dark:border-l-this-light border-4 border-transparent px-4 py-4 cursor-pointer hover:shadow-md transition-shadow"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Pet & Client Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar
                        size={12}
                        name={appointment.pet.name}
                        src={appointment.pet.avatar}
                        classNames={{ display: "mask is-squircle rounded-lg" }}
                        initialColor="auto"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-800 dark:text-dark-100">
                          {appointment.pet.name}
                        </p>
                        <p className="dark:text-dark-300 text-xs text-gray-400">
                          {appointment.pet.species} • {appointment.pet.breed}
                        </p>
                        <p className="dark:text-dark-300 mt-1 text-sm text-gray-600">
                          {appointment.client.first_name} {appointment.client.last_name}
                        </p>
                      </div>
                    </div>

                    {/* Right: Status Icon */}
                    <StatusIcon status={appointment.status} />
                  </div>

                  {/* Appointment Details */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
                          {appointment.appointment_type}
                        </p>
                        {appointment.reason_for_visit && (
                          <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-500 line-clamp-1">
                            {appointment.reason_for_visit}
                          </p>
                        )}
                      </div>
                      <Badge color={statusColor} variant="outlined" className="text-xs flex-shrink-0 ml-2">
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Time & Video Badge */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-dark-600 pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="size-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold text-gray-800 dark:text-dark-100">
                        {appointment.start_time} - {appointment.end_time}
                      </span>
                    </div>
                    
                    {appointment.is_video_conseil && (
                      <Badge color="info" variant="soft" className="text-xs">
                        <VideoCameraIcon className="size-3 mr-1" />
                        {t('common.video') || 'Video'}
                      </Badge>
                    )}
                  </div>
                </Box>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex justify-center">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                siblings={1}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
