// Import Dependencies
import {
  ArrowPathIcon,
  ArrowUpIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import Chart, { Props } from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Local Imports
import { Button } from "@/components/ui";

// ----------------------------------------------------------------------

const series: Props["series"] = [
  {
    name: "Sales",
    data: [654, 820, 102, 540, 154, 614],
  },
];

const chartConfig: ApexOptions = {
  colors: ["#4DB9AD"],
  chart: {
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  grid: {
    padding: {
      left: 0,
      right: 0,
      top: -20,
      bottom: -10,
    },
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  yaxis: {
    show: false,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
};

interface InfoProps {
  totalRevenue: number;
  monthlyRevenue?: Record<number, number>;
}

export function Info({ totalRevenue, monthlyRevenue = {} }: InfoProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k MAD`;
    }
    return `${value.toFixed(0)} MAD`;
  };

  // Calculate current month revenue
  const currentMonthRevenue = Object.values(monthlyRevenue).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate growth percentage based on last month (if available)
  const days = Object.keys(monthlyRevenue).map(Number).sort((a, b) => a - b);
  const revenueData = days.map(day => monthlyRevenue[day] || 0);
  const growthPercent = revenueData.length > 1 
    ? ((revenueData[revenueData.length - 1] - revenueData[0]) / (revenueData[0] || 1)) * 100 
    : 0;

  return (
    <div className="mt-4 flex shrink-0 flex-col items-center sm:items-start">
      <ChartPieIcon className="this:info text-this dark:text-this-lighter size-8" />
      <div className="mt-4">
        <div className="flex items-center gap-1">
          <p className="dark:text-dark-100 text-2xl font-semibold text-gray-800">
            {formatCurrency(currentMonthRevenue || totalRevenue)}
          </p>
          <Button variant="flat" isIcon className="size-6 rounded-full">
            <ArrowPathIcon className="size-4" />
          </Button>
        </div>
        <p className="dark:text-dark-300 text-xs text-gray-400">this month</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="ax-transparent-gridline w-28">
          <Chart
            colors={["#4DB9AD"]}
            options={chartConfig}
            series={[{
              name: "Sales",
              data: revenueData.length > 0 ? revenueData : [0],
            }]}
            type="line"
            height={60}
          />
        </div>
        <div className="flex items-center gap-0.5">
          {growthPercent >= 0 ? (
            <ArrowUpIcon className="this:success text-this dark:text-this-lighter size-4" />
          ) : (
            <ArrowUpIcon className="this:error text-this dark:text-this-lighter size-4 rotate-180" />
          )}
          <p className="text-sm-plus dark:text-dark-100 text-gray-800">
            {Math.abs(growthPercent).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

