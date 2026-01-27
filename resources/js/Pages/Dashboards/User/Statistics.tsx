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
      color: "this:primary",
    },
    {
      id: "total",
      label: t("common.user_dashboard.statistics.total_appointments") || "Total Appointments",
      value: statistics.totalAppointments,
      icon: CalendarIcon,
      color: "this:success",
    },
    {
      id: "upcoming",
      label: t("common.user_dashboard.statistics.upcoming") || "Upcoming",
      value: statistics.upcomingAppointments,
      icon: ClockIcon,
      color: "this:warning",
    },
    {
      id: "completed",
      label: t("common.user_dashboard.statistics.completed") || "Completed",
      value: statistics.completedAppointments,
      icon: CheckCircleIcon,
      color: "this:info",
    },
    {
      id: "cancelled",
      label: t("common.user_dashboard.statistics.cancelled") || "Cancelled",
      value: statistics.cancelledAppointments,
      icon: XCircleIcon,
      color: "this:secondary",
    },
    {
      id: "video",
      label: t("common.user_dashboard.statistics.video_consultations") || "Video Consultations",
      value: statistics.videoConsultations,
      icon: VideoCameraIcon,
      color: "this:error",
    },
  ];

  return (
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
             <Card className="p-3 lg:p-4">
             <div className="flex justify-between gap-1">
               <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                 {stat.value}
               </p>
               <stat.icon className={`${stat.color} size-5 text-this dark:text-this-light`} />
             </div>
             <p className="mt-1 text-xs-plus">
               {stat.label}
             </p>
           </Card>
          
        ))}
      </div>
  );
}

