// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Local Imports
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

const series = [
  {
    name: "Start",
    data: [44, 55, 41, 25, 22, 56],
  },
  {
    name: "End",
    data: [13, 23, 20, 60, 13, 16],
  },
];

const chartConfig: ApexOptions = {
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 10,
      bottom: -12,
      top: 0,
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
  chart: {
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
    stacked: true,
    stackType: "100%",
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    colors: ["#0EA5E9", "#e2e8f0"],
  },
  plotOptions: {
    bar: {
      borderRadius: 2,
      horizontal: false,
      columnWidth: 30,
    },
  },
  legend: {
    show: false,
  },
};

export function Budget() {
  const { t } = useTranslation();

  return (
    <Card className="px-4 pb-5 sm:px-5 lg:mt-6">
      <div className="flex min-w-0 items-center justify-between py-3">
        <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          {t("common.vet_dashboard.budget.title")}
        </h2>
      </div>
      <div className="flex grow gap-5">
        <div className="flex w-1/2 flex-col">
          <div className="grow">
            <p className="dark:text-dark-100 text-2xl font-semibold text-gray-800">
              $67.4k
            </p>
            <a
              href="##"
              className="text-tiny text-primary-600 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400 dark:focus:text-primary-400/70 border-b border-dotted border-current pb-0.5 font-medium uppercase outline-hidden transition-colors duration-300"
            >
              {t("common.vet_dashboard.budget.yearly_budget")}
            </a>
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-normal">
            {t("common.vet_dashboard.budget.spent_description")}
          </p>
        </div>
        <div className="ax-transparent-gridline flex w-1/2 items-end">
          <div className="min-w-0">
            <Chart
              type="bar"
              height="120"
              options={chartConfig}
              series={series}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}