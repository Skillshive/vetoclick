// Local Imports
import { Card, Select } from "@/components/ui";
import { Statistics } from "./Statistics";
import { ViewChart } from "./ViewChart";

// ----------------------------------------------------------------------

interface PageViewsProps {
  totalRevenue: number;
  monthlyIncrease: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingRevenue: number;
  completedOrders: number;
  yearlyRevenue: Array<{ month: number; total: number }>;
}

export function PageViews({
  totalRevenue,
  monthlyIncrease,
  totalOrders,
  averageOrderValue,
  pendingRevenue,
  completedOrders,
  yearlyRevenue,
}: PageViewsProps) {
  return (
    <Card className="pb-4 overflow-hidden">
      <div className="flex min-w-0 items-center justify-between px-4 pt-3 sm:px-5">
        <h2 className="text-sm-plus font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Revenue Overview
        </h2>
        <div className="flex items-center gap-4">
          <div className="hidden cursor-pointer items-center gap-2 sm:flex">
            <div
              className="size-3 rounded-full"
              style={{
                backgroundColor: "#4DB9AD",
              }}
            ></div>
            <p>Current Period</p>
          </div>
          <div className="hidden cursor-pointer items-center gap-2 sm:flex">
            <div
              className="size-3 rounded-full"
              style={{
                backgroundColor: "#FF9800",
              }}
            ></div>
            <p>Previous Period</p>
          </div>
          <Select className="h-8 rounded-full text-xs">
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_year">Last Year</option>
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

