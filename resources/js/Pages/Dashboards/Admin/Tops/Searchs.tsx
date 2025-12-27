// Import Dependencies
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card, Select } from "@/components/ui";

// ----------------------------------------------------------------------

interface Product {
  uid: string;
  text: string;
  search: string;
  impression: number;
}

interface SearchsProps {
  topSoldPacks?: Array<{
    name: string;
    quantity: number;
  }>;
}

export function Searchs({ topSoldPacks = [] }: SearchsProps) {
  const totalSearches = topSoldPacks.reduce((sum, pack) => sum + pack.quantity, 0);
  const growthRate = topSoldPacks.length > 0 ? "4.3" : "0";

  // Map top sold packs to search terms format
  const terms: Product[] = topSoldPacks.slice(0, 5).map((pack, index) => ({
    uid: String(index + 1),
    text: pack.name,
    search: pack.quantity.toLocaleString(),
    impression: pack.quantity > 0 ? 0.19 : -0.21,
  }));

  // Fill with default data if not enough packs
  const defaultTerms: Product[] = [
    {
      uid: "2",
      text: "Premium Pack",
      search: "0",
      impression: 0.01,
    },
    {
      uid: "4",
      text: "Basic Pack",
      search: "0",
      impression: -0.21,
    },
    {
      uid: "6",
      text: "Standard Pack",
      search: "0",
      impression: 0.19,
    },
    {
      uid: "8",
      text: "Deluxe Pack",
      search: "0",
      impression: 0.08,
    },
    {
      uid: "10",
      text: "Starter Pack",
      search: "0",
      impression: 0.06,
    },
  ];

  const displayTerms = terms.length > 0 ? terms : defaultTerms;

  return (
    <Card className="px-4 pb-4">
      <div className="flex min-w-0 items-center justify-between gap-3 py-3">
        <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          Top Products
        </h2>
        <Select className="h-8 text-xs">
          <option value="last_week">Last Week</option>
          <option value="last_month">Last Month</option>
          <option value="last_year">Last Year</option>
        </Select>
      </div>
      <p>
        <span className="dark:text-dark-100 text-3xl font-medium text-gray-800">
          {totalSearches.toLocaleString()}
        </span>{" "}
        <span className="text-success dark:text-success-lighter text-xs">
          +{growthRate}%
        </span>
      </p>
      <p className="text-xs-plus dark:text-dark-300 mt-0.5 text-gray-400">
        Total Sales
      </p>
      <div className="mt-4 flex justify-between">
        <p className="dark:text-dark-300 text-xs text-gray-400 uppercase">
          Product
        </p>
        <p className="dark:text-dark-300 text-xs text-gray-400 uppercase">
          Sales
        </p>
      </div>
      <div className="mt-2 space-y-2.5">
        {displayTerms.map((term) => (
          <div key={term.uid} className="flex min-w-0 justify-between gap-4">
            <a href="##" className="truncate hover:underline hover:opacity-80">
              {term.text}
            </a>
            <div className="flex items-center gap-1.5">
              <p className="text-sm-plus dark:text-dark-100 text-gray-800">
                {term.search}
              </p>
              {term.impression > 0 ? (
                <ArrowUpIcon className="this:success text-this dark:text-this-lighter size-3 stroke-2" />
              ) : (
                <ArrowDownIcon className="this:error text-this dark:text-this-lighter size-3 stroke-2" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

