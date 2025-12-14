// Import Dependencies
import {
  CheckBadgeIcon,
  ClockIcon,
  CubeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface StatisticsProps {
  statistics?: {
    appointments: number;
    pending: number;
    cancelled: number;
    pets: number;
    clients: number;
    new_clients: number;
  };
}

export function Statistics({ statistics }: StatisticsProps) {
  const { t } = useTranslation();
  
  // Default values if statistics are not provided
  const stats = statistics || {
    appointments: 0,
    pending: 0,
    cancelled: 0,
    pets: 0,
    clients: 0,
    new_clients: 0,
  };

  return (
    <div className="col-span-12 lg:col-span-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-2">
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {stats.appointments}
            </p>
            <ClockIcon className="this:primary size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">
            {t("common.vet_dashboard.statistics.appointments")}
          </p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {stats.pending}
            </p>
            <CheckBadgeIcon className="this:success size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">
            {t("common.vet_dashboard.statistics.pending")}
          </p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {stats.cancelled}
            </p>
            <ClockIcon className="this:warning size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">
            {t("common.vet_dashboard.statistics.cancelled")}
          </p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {stats.pets}
            </p>
            <UsersIcon className="this:info size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">
            {t("common.vet_dashboard.statistics.pets")}
          </p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {stats.clients}
            </p>
            <UsersIcon className="this:secondary size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">
            {t("common.vet_dashboard.statistics.clients")}
          </p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {stats.new_clients}
            </p>
            <UsersIcon className="this:error size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">
            {t("common.vet_dashboard.statistics.new_clients")}
          </p>
        </Card>
      </div>
    </div>
  );
}
