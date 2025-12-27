// Local Imports
import { Card, Select } from "@/components/ui";
import { Statistics } from "./Statistics";
import { ViewChart } from "./ViewChart";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface RevenueChartProps {
  totalRevenue: number;
  monthlyIncrease: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingRevenue: number;
  completedOrders: number;
  yearlyRevenue: Array<{ month: number; total: number }>;
}

export function RevenueChart({
  totalRevenue,
  monthlyIncrease,
  totalOrders,
  averageOrderValue,
  pendingRevenue,
  completedOrders,
  yearlyRevenue,
}: RevenueChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="pb-4 overflow-hidden">
      <div className="flex min-w-0 items-center justify-between px-4 pt-3 sm:px-5">
        <h2 className="text-sm-plus font-medium tracking-wide text-gray-800 dark:text-dark-100">
          {t("common.revenue_current_year") || "Revenue - Current Year"}
        </h2>
        <div className="flex items-center gap-4">
          <Select className="h-8 rounded-full text-xs">
            <option value="current_year">{t("common.current_year") || "Current Year"}</option>
            <option value="last_year">{t("common.last_year") || "Last Year"}</option>
          </Select>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-12">
        <Statistics
          totalRevenue={totalRevenue}
          monthlyIncrease={monthlyIncrease}
          totalOrders={totalOrders}
          averageOrderValue={averageOrderValue}
          pendingRevenue={pendingRevenue}
          completedOrders={completedOrders}
        />
        <ViewChart yearlyRevenue={yearlyRevenue} />
      </div>
    </Card>
  );
}




