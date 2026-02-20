// Import Dependencies
import { useMemo } from "react";

// Local Imports
import { Box } from "@/components/ui";

// ----------------------------------------------------------------------

interface CustomerSatisfactionProps {
  topSoldPacks?: Array<{ name: string; quantity: number }>;
}

export function CustomerSatisfaction({ topSoldPacks = [] }: CustomerSatisfactionProps) {
  const totalSold = useMemo(() => {
    return topSoldPacks.reduce((sum, pack) => sum + pack.quantity, 0);
  }, [topSoldPacks]);

  const packsWithPercentages = useMemo(() => {
    if (totalSold === 0) return [];
    
    return topSoldPacks.slice(0, 5).map((pack, index) => {
      const percentage = (pack.quantity / totalSold) * 100;
      const colors = ["primary", "success", "info", "warning", "error"];
      return {
        ...pack,
        percentage: Math.round(percentage),
        color: colors[index] || "primary",
      };
    });
  }, [topSoldPacks, totalSold]);

  const totalPercentage = useMemo(() => {
    return packsWithPercentages.reduce((sum, pack) => sum + pack.percentage, 0);
  }, [packsWithPercentages]);

  const performanceScore = useMemo(() => {
    if (packsWithPercentages.length === 0) return 0;
    // Calculate weighted score based on top packs
    const score = packsWithPercentages.reduce((sum, pack, index) => {
      const weight = 5 - index; // Higher weight for top sellers
      return sum + (pack.percentage * weight);
    }, 0) / packsWithPercentages.reduce((sum, _, index) => sum + (5 - index), 0);
    return (score / 10).toFixed(1);
  }, [packsWithPercentages]);

  return (
    <Box className="col-span-12 lg:col-span-4">
      <div className="flex min-w-0 items-center justify-between">
        <h2 className="min-w-0 font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Top Sold Packs
        </h2>
      </div>
      <div className="mt-3">
        <p>
          <span className="text-3xl text-gray-800 dark:text-dark-100">{performanceScore}</span>
          <span className="this:success text-xs text-this dark:text-this-lighter">
            +{totalPercentage > 0 ? "2.1" : "0"}%
          </span>
        </p>
        <p className="text-xs-plus">Performance score</p>
      </div>
      <div className="mt-4 flex w-full gap-1">
        {packsWithPercentages.map((pack, index) => (
          <div
            key={index}
            className={`this:${pack.color} h-2 rounded-full bg-this dark:bg-this-light`}
            style={{ width: `${pack.percentage}%` }}
          />
        ))}
      </div>
      <div className="hide-scrollbar mt-4 min-w-full overflow-x-auto">
        <table className="w-full">
          <tbody>
            {packsWithPercentages.length > 0 ? (
              packsWithPercentages.map((pack, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-2">
                    <div className="flex items-center gap-2">
                      <div className={`this:${pack.color} size-3.5 rounded-full border-2 border-this dark:border-this-light`}></div>
                      <p className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
                        {pack.name}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-2 text-end">
                    <p className="font-medium text-gray-800 dark:text-dark-100">
                      {pack.quantity.toLocaleString()}
                    </p>
                  </td>
                  <td className="whitespace-nowrap py-2 text-end">{pack.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Box>
  );
}

