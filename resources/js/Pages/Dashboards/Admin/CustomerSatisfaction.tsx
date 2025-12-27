// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment, useMemo } from "react";

// Local Imports
import { Box, Button } from "@/components/ui";

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
        <ActionMenu />
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

function ActionMenu() {
  return (
    <Menu
      as="div"
      className="relative inline-block text-left ltr:-mr-1 rtl:-ml-1"
    >
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-8 rounded-full"
      >
        <EllipsisHorizontalIcon className="size-5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0">
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Action</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Another action</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Other action</span>
              </button>
            )}
          </MenuItem>

          <hr className="mx-3 my-1.5 h-px border-gray-150 dark:border-dark-500" />

          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Separated action</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

