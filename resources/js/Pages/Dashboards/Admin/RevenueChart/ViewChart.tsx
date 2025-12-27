import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useTranslation } from "@/hooks/useTranslation";

interface ViewChartProps {
  yearlyRevenue: Array<{ month: number; total: number }>;
}

export function ViewChart({ yearlyRevenue }: ViewChartProps) {
  const { t } = useTranslation();

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearlyRevenueWithLabels = monthLabels.map((label, index) => {
    const data = yearlyRevenue.find((item) => item.month === index + 1);
    return { label, total: data ? data.total : 0 };
  });

  // Demo fallback data
  const demoYearlyRevenueWithLabels = [
    { label: "Jan", total: 12000 },
    { label: "Feb", total: 15000 },
    { label: "Mar", total: 18000 },
    { label: "Apr", total: 16000 },
    { label: "May", total: 20000 },
    { label: "Jun", total: 22000 },
    { label: "Jul", total: 19500 },
    { label: "Aug", total: 21000 },
    { label: "Sep", total: 23000 },
    { label: "Oct", total: 25000 },
    { label: "Nov", total: 24000 },
    { label: "Dec", total: 26000 },
  ];

  const hasRealRevenue = yearlyRevenueWithLabels.some((item) => item.total > 0);
  const revenueToShow = hasRealRevenue ? yearlyRevenueWithLabels : demoYearlyRevenueWithLabels;

  const series = [
    {
      name: t("common.revenue") || "Revenue",
      data: revenueToShow.map((item) => item.total),
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
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        barHeight: "90%",
        columnWidth: "35%",
      },
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: revenueToShow.map((item) => item.label),
      labels: {
        hideOverlappingLabels: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    grid: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: -10,
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
    responsive: [
      {
        breakpoint: 1024,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "55%",
            },
          },
        },
      },
    ],
  };

  return (
    <div className="ax-transparent-gridline col-span-12 px-2 sm:col-span-6 lg:col-span-8">
      <Chart options={chartConfig} series={series} type="bar" height={280} />
    </div>
  );
}




