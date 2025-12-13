// Import Dependencies
import {
  VideoCameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Link } from "@inertiajs/react";

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
  const { t } = useTranslation();

  const formatDate = (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            statusColor === "success" && "text-primary-500 dark:text-primary-400",
            statusColor === "warning" && "text-warning-600 dark:text-warning-400",
            statusColor === "error" && "text-error-600 dark:text-error-400",
            statusColor === "info" && "text-info-600 dark:text-info-400",
          )} />
        </div>
        
        <p className="dark:text-dark-100 text-sm font-semibold text-gray-800 mb-1">
          {appointment.appointment_type}
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

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="size-4 text-gray-400 dark:text-dark-300" />
          <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
            {formatDate(appointment.appointment_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-gray-400 dark:text-dark-300" />
          <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
            {appointment.start_time} - {appointment.end_time}
          </p>
        </div>
      </div>

      {(appointment.is_video_conseil && appointment.video_join_url) ? (
        <div className="mt-6">
          <Button
            color="primary"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              window.open(appointment.video_join_url, '_blank');
            }}
          >
            <VideoCameraIcon className="size-4 mr-2" />
            {t("common.vet_dashboard.appointment_card.join_video_call") || "Join Video Call"}
          </Button>
        </div>
      ) : null}
    </Box>
  );
}

