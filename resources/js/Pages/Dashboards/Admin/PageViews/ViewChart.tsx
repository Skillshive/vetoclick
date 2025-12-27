import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface ViewChartProps {
  yearlyRevenue: Array<{ month: number; total: number }>;
}

export function ViewChart({ yearlyRevenue }: ViewChartProps) {
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Process revenue data
  const currentPeriodData = monthLabels.map((_, index) => {
    const data = yearlyRevenue.find((item) => item.month === index + 1);
    return data ? data.total : 0;
  });

  // Generate previous period data (slightly lower for demo)
  const previousPeriodData = currentPeriodData.map((value) => 
    Math.max(0, value * 0.7 + Math.random() * value * 0.3)
  );

  const series = [
    {
      name: "Previous Period",
      data: previousPeriodData,
    },
    {
      name: "Current Period",
      data: currentPeriodData,
    },
  ];

  const chartConfig: ApexOptions = {
    colors: ["#FF9800", "#4DB9AD"],

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
      categories: monthLabels,
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

