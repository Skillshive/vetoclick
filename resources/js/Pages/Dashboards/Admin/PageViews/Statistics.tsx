// Import Dependencies
import { useState } from "react";

// Local Imports
import { Combobox } from "@/components/shared/form/StyledCombobox";

// ----------------------------------------------------------------------

// Types
interface Period {
  id: number;
  name: string;
}

const periods: Period[] = [
  { id: 1, name: "This Month" },
  { id: 2, name: "Last Month" },
  { id: 3, name: "This Quarter" },
  { id: 4, name: "Last Quarter" },
  { id: 5, name: "This Year" },
  { id: 6, name: "Last Year" },
];

interface StatisticsProps {
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
}: StatisticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="col-span-12 px-4 sm:col-span-6 sm:px-5 lg:col-span-4">
      <Combobox
        data={periods}
        displayField="name"
        value={selectedPeriod}
        onChange={setSelectedPeriod}
        placeholder="Please Select Period"
        searchFields={["name"]}
      />

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            Total Revenue
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            Monthly increase
          </p>
          <p className="mt-1">
            <span className="text-xl font-medium text-gray-800 dark:text-dark-100">
              {formatCurrency(monthlyIncrease)}
            </span>{" "}
            <span className="text-xs text-success dark:text-success-lighter">
              +3%
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            Orders made
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatNumber(totalOrders)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            Avg order value
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(averageOrderValue)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            Pending revenue
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatCurrency(pendingRevenue)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
            Completed orders
          </p>
          <p className="mt-1 text-xl font-medium text-gray-800 dark:text-dark-100">
            {formatNumber(completedOrders)}
          </p>
        </div>
      </div>
    </div>
  );
}

