// Import Dependencies
import { useState, useMemo } from "react";

// Local Imports
import { Box } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Info } from "./Info";
import { SalesChart } from "./SalesChart";

// ----------------------------------------------------------------------

interface OverviewProps {
  yearlyRevenue: Array<{ month: number; total: number }>;
  monthlyRevenue: Record<number, number>;
  totalRevenue: number;
}

export function Overview({ yearlyRevenue, monthlyRevenue, totalRevenue }: OverviewProps) {
  // Initialize with current month as default
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  const defaultStartDate = getDefaultStartDate();
  const defaultEndDate = getDefaultEndDate();

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Process data based on selected date range
  const chartData = useMemo(() => {
    if (!startDate || !endDate) {
      return { series: [{ name: "Sales", data: [] }], categories: [] };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the end date
    
    // Determine if we should show daily or monthly data based on date range
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 31) {
      // Show daily data for ranges <= 31 days
      const categories: string[] = [];
      const salesData: number[] = [];
      const currentDate = new Date(start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfMonth = currentDate.getDate();
        
        // Format as "MM/DD" for display
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(dayOfMonth).padStart(2, '0');
        categories.push(`${month}/${day}`);
        
        // Use monthlyRevenue if it's the current month, otherwise use 0
        // For demo purposes, we'll use monthlyRevenue data if available
        const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                              currentDate.getFullYear() === today.getFullYear();
        salesData.push(isCurrentMonth ? (monthlyRevenue[dayOfMonth] || 0) : 0);
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        series: [{ name: "Sales", data: salesData }],
        categories,
      };
    } else {
      // Show monthly data for ranges > 31 days
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const revenueArray = Array.isArray(yearlyRevenue) ? yearlyRevenue : [];
      const revenueMap = new Map(revenueArray.map(item => [item.month, item.total]));
      
      // Get months in the selected range
      const monthsInRange: string[] = [];
      const salesData: number[] = [];
      const currentDate = new Date(start);
      currentDate.setDate(1); // Start from first day of month
      
      while (currentDate <= end) {
        const month = currentDate.getMonth() + 1; // 1-12
        const monthLabel = monthLabels[month - 1];
        const year = currentDate.getFullYear();
        const fullLabel = `${monthLabel} ${year}`;
        
        if (!monthsInRange.includes(fullLabel)) {
          monthsInRange.push(fullLabel);
          salesData.push(revenueMap.get(month) || 0);
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      return {
        series: [{ name: "Sales", data: salesData }],
        categories: monthsInRange,
      };
    }
  }, [startDate, endDate, yearlyRevenue, monthlyRevenue]);

  return (
    <Box className="col-span-12 lg:col-span-8">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Sales Overview
        </h2>
        <div className="w-full sm:w-auto">
          <DatePicker
            options={{
              mode: "range",
              dateFormat: "Y-m-d",
              defaultDate: [defaultStartDate, defaultEndDate],
            }}
            value={startDate && endDate ? [startDate, endDate] : undefined}
            onChange={(selectedDates, dateStr) => {
              if (selectedDates && selectedDates.length === 2) {
                const start = selectedDates[0].toISOString().split('T')[0];
                const end = selectedDates[1].toISOString().split('T')[0];
                setStartDate(start);
                setEndDate(end);
              }
            }}
            placeholder="Choose date range..."
            className="w-full sm:w-auto"
            classNames={{
              input: "text-xs-plus h-9",
            }}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-7">
        <Info totalRevenue={totalRevenue} monthlyRevenue={monthlyRevenue} />
        <SalesChart key={`${startDate}-${endDate}`} series={chartData.series} categories={chartData.categories} />
      </div>
    </Box>
  );
}

