// Import Dependencies
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  XCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface StatisticsProps {
  statistics: {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    videoConsultations: number;
    totalPets: number;
  };
}

export function Statistics({ statistics }: StatisticsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      id: "pets",
      label: t("common.user_dashboard.statistics.my_pets") || "My Pets",
      value: statistics.totalPets,
      icon: HeartIcon,
      bgClass: "bg-secondary-light dark:bg-secondary-dark-light",
      iconClass: "text-secondary-light dark:text-secondary-light",
    },
    {
      id: "total",
      label: t("common.user_dashboard.statistics.total_appointments") || "Total Appointments",
      value: statistics.totalAppointments,
      icon: CalendarIcon,
      bgClass: "bg-primary-500 dark:bg-[#1B2441]",
      iconClass: "text-primary dark:text-primary",
    },
    {
      id: "upcoming",
      label: t("common.user_dashboard.statistics.upcoming") || "Upcoming",
      value: statistics.upcomingAppointments,
      icon: ClockIcon,
      bgClass: "bg-warning-light dark:bg-warning-dark-light",
      iconClass: "text-warning dark:text-warning",
    },
    {
      id: "completed",
      label: t("common.user_dashboard.statistics.completed") || "Completed",
      value: statistics.completedAppointments,
      icon: CheckCircleIcon,
      bgClass: "bg-success-light dark:bg-success-dark-light",
      iconClass: "text-success dark:text-success",
    },
    {
      id: "cancelled",
      label: t("common.user_dashboard.statistics.cancelled") || "Cancelled",
      value: statistics.cancelledAppointments,
      icon: XCircleIcon,
      bgClass: "bg-error dark:bg-danger-dark-light",
      iconClass: "text-error dark:text-error",
    },
    {
      id: "video",
      label: t("common.user_dashboard.statistics.video_consultations") || "Video Consultations",
      value: statistics.videoConsultations,
      icon: VideoCameraIcon,
      bgClass: "bg-info-light dark:bg-info-dark-light",
      iconClass: "text-info dark:text-info",
    },
    
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
      {stats.map((stat) => (
        <Card key={stat.id} className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs-plus text-gray-500 dark:text-dark-300 truncate">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-dark-100">
                {stat.value}
              </p>
            </div>
            <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ml-2")}>
              <stat.icon className={clsx(`this:${stat.bgClass}`, "size-6 this", stat.iconClass)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

