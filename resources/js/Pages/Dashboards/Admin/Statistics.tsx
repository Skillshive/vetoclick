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

// ----------------------------------------------------------------------

interface StatisticsProps {
  stats?: {
    totalRevenue?: number;
    totalOrders?: number;
    pendingOrders?: number;
    completedOrders?: number;
    totalProducts?: number;
    totalClients?: number;
  };
  financialStats?: {
    totalRevenue?: number;
    pendingRevenue?: number;
  };
}

export function Statistics({ stats = {}, financialStats = {} }: StatisticsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k MAD`;
    }
    return `${value.toFixed(0)} MAD`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-2">
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {formatCurrency(financialStats.totalRevenue || 0)}
            </p>
            <CurrencyDollarIcon className="this:primary size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">Income</p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {formatNumber(stats.completedOrders || 0)}
            </p>
            <CheckBadgeIcon className="this:success size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">Completed</p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {formatNumber(stats.pendingOrders || 0)}
            </p>
            <ClockIcon className="this:warning size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">Pending</p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {formatNumber(stats.totalOrders || 0)}
            </p>
            <TruckIcon className="this:info size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">Total Orders</p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {formatNumber(stats.totalProducts || 0)}
            </p>
            <CubeIcon className="this:secondary size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">Products</p>
        </Card>
        <Card className="p-3 lg:p-4">
          <div className="flex justify-between gap-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {formatNumber(stats.totalClients || 0)}
            </p>
            <UsersIcon className="this:error size-5 text-this dark:text-this-light" />
          </div>
          <p className="mt-1 text-xs-plus">Customers</p>
        </Card>
      </div>
    </div>
  );
}

