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
    },
    {
      id: "total",
      label: t("common.user_dashboard.statistics.total_appointments") || "Total Appointments",
      value: statistics.totalAppointments,
      icon: CalendarIcon,
    },
    {
      id: "upcoming",
      label: t("common.user_dashboard.statistics.upcoming") || "Upcoming",
      value: statistics.upcomingAppointments,
      icon: ClockIcon,
    },
    {
      id: "completed",
      label: t("common.user_dashboard.statistics.completed") || "Completed",
      value: statistics.completedAppointments,
      icon: CheckCircleIcon,
    },
    {
      id: "cancelled",
      label: t("common.user_dashboard.statistics.cancelled") || "Cancelled",
      value: statistics.cancelledAppointments,
      icon: XCircleIcon,
    },
    {
      id: "video",
      label: t("common.user_dashboard.statistics.video_consultations") || "Video Consultations",
      value: statistics.videoConsultations,
      icon: VideoCameraIcon,
    },
  ];

  return (
    <Card className="px-4 pb-4 sm:px-5">
      <div className="flex h-14 min-w-0 items-center justify-between py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          {t("common.statistics_title") || "Statistics"}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="flex flex-col rounded-xl border border-gray-200 dark:border-dark-500 p-3 hover:shadow-sm hover:border-primary-100 dark:hover:border-primary-500/40 hover:bg-gray-50 dark:hover:bg-dark-800/60 transition-colors duration-200"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-lg font-semibold text-gray-800 dark:text-dark-50 leading-tight">
                {stat.value}
              </p>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                <stat.icon className="size-4" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-300 truncate">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

