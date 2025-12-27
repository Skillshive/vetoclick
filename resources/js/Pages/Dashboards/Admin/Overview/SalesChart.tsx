// Import Dependencies
import Chart, { Props } from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

// ----------------------------------------------------------------------

const baseChartConfig: ApexOptions = {
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
    min: 0,
  },
  responsive: [
    {
      breakpoint: 850,
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

export function SalesChart({
  categories,
  series,
}: {
  categories: string[] | number[];
  series: Props["series"];
}) {
  // Memoize chart options to ensure proper updates
  const chartOptions = useMemo(() => {
    const options = JSON.parse(JSON.stringify(baseChartConfig));
    options.xaxis = {
      ...options.xaxis,
      categories: categories || [],
    };
    return options;
  }, [categories]);
  
  // Ensure series is valid and has data
  const validSeries = useMemo(() => {
    if (Array.isArray(series) && series.length > 0) {
      return series;
    }
    const defaultData = Array.isArray(categories) && categories.length > 0
      ? categories.map(() => 0)
      : [];
    return [{ name: "Sales", data: defaultData }];
  }, [series, categories]);
  
  // Create a unique key based on categories to force re-render when switching views
  const chartKey = useMemo(() => {
    return Array.isArray(categories) ? categories.join('-') : 'default';
  }, [categories]);
  
  // Ensure we have valid data before rendering
  if (!categories || (Array.isArray(categories) && categories.length === 0)) {
    return (
      <div className="ax-transparent-gridline grid w-full grid-cols-1">
        <div className="flex h-[255px] items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="ax-transparent-gridline grid w-full grid-cols-1">
      <div style={{ minHeight: '255px', width: '100%' }}>
        <Chart 
          key={chartKey}
          options={chartOptions} 
          height="255" 
          type="bar" 
          series={validSeries} 
        />
      </div>
    </div>
  );
}

