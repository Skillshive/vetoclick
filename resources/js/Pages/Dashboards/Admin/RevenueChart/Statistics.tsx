// Import Dependencies
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface RevenueStatisticsProps {
  totalRevenue: number;
  monthlyIncrease: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingRevenue: number;
  completedOrders: number;
}

export function Statistics({
  totalRevenue,
  monthlyIncrease,
  totalOrders,
  averageOrderValue,
  pendingRevenue,
  completedOrders,
}: RevenueStatisticsProps) {
  const { t } = useTranslation();
  const currency = t("common.currency") || "MAD";

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="col-span-12 px-4 sm:col-span-6 sm:px-5 lg:col-span-4">
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            {t("common.total_revenue") || "Total Revenue"}
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            {t("common.monthly_increase") || "Monthly increase"}
          </p>
          <p className="mt-1">
            <span className="text-xl font-medium text-gray-800 dark:text-dark-100">
              {formatCurrency(monthlyIncrease)}
            </span>{" "}
            <span className="text-xs text-success dark:text-success-lighter">
              +{totalRevenue > 0 ? ((monthlyIncrease / totalRevenue) * 100).toFixed(1) : "0.0"}%
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            {t("common.total_orders") || "Total Orders"}
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatNumber(totalOrders)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            {t("common.average_order_value") || "Avg order value"}
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(averageOrderValue)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            {t("common.pending_revenue") || "Pending Revenue"}
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(pendingRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            {t("common.completed_orders") || "Completed Orders"}
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatNumber(completedOrders)}
          </p>
        </div>
      </div>
    </div>
  );
}

