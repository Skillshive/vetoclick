import { CalendarIcon, ClockIcon, CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui";

interface QuickStatsProps {
  stats: {
    todayTotal: number;
    pendingRequests: number;
    completedToday: number;
    cancelledToday: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
      <Card className="p-3 lg:p-4">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            {stats.todayTotal}
          </p>
          <CalendarIcon className="this:primary size-5 text-this dark:text-this-light" />
        </div>
        <p className="mt-1 text-xs-plus">{t("common.todays_appointments") || "Today's Appointments"}</p>
      </Card>
      
      <Card className="p-3 lg:p-4">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            {stats.pendingRequests}
          </p>
          <ClockIcon className="this:warning size-5 text-this dark:text-this-light" />
        </div>
        <p className="mt-1 text-xs-plus">{t("common.pending_requests") || "Pending Requests"}</p>
      </Card>
      
      <Card className="p-3 lg:p-4">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            {stats.completedToday}
          </p>
          <CheckBadgeIcon className="this:success size-5 text-this dark:text-this-light" />
        </div>
        <p className="mt-1 text-xs-plus">{t("common.completed_today") || "Completed"}</p>
      </Card>
      
      <Card className="p-3 lg:p-4">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            {stats.cancelledToday}
          </p>
          <XCircleIcon className="this:error size-5 text-this dark:text-this-light" />
        </div>
        <p className="mt-1 text-xs-plus">{t("common.cancelled_today") || "Cancelled"}</p>
      </Card>
    </div>
  );
}

