// Import Dependencies
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card, Select } from "@/components/ui";

// ----------------------------------------------------------------------

interface Visitor {
  uid: string;
  name: string;
  visits: string;
  impression: number;
}

interface VisitorsProps {
  stats?: {
    totalClients: number;
    newClientsThisMonth: number;
  };
}

const defaultVisitors: Visitor[] = [
  {
    uid: "1",
    name: "New Clients This Month",
    visits: "0",
    impression: 0.19,
  },
  {
    uid: "2",
    name: "Active Clients",
    visits: "0",
    impression: 0.01,
  },
  {
    uid: "3",
    name: "Returning Clients",
    visits: "0",
    impression: 0.08,
  },
  {
    uid: "4",
    name: "Inactive Clients",
    visits: "0",
    impression: -0.21,
  },
  {
    uid: "5",
    name: "Total Clients",
    visits: "0",
    impression: 0.06,
  },
];

export function Visitors({ stats }: VisitorsProps) {
  const totalClients = stats?.totalClients || 0;
  const newClients = stats?.newClientsThisMonth || 0;
  const growthRate = totalClients > 0 ? ((newClients / totalClients) * 100).toFixed(1) : "0";

  const visitors: Visitor[] = [
    {
      uid: "1",
      name: "New Clients This Month",
      visits: newClients.toLocaleString(),
      impression: newClients > 0 ? 0.19 : 0,
    },
    {
      uid: "2",
      name: "Active Clients",
      visits: Math.floor(totalClients * 0.7).toLocaleString(),
      impression: 0.01,
    },
    {
      uid: "3",
      name: "Returning Clients",
      visits: Math.floor(totalClients * 0.5).toLocaleString(),
      impression: 0.08,
    },
    {
      uid: "4",
      name: "Inactive Clients",
      visits: Math.floor(totalClients * 0.1).toLocaleString(),
      impression: -0.21,
    },
    {
      uid: "5",
      name: "Total Clients",
      visits: totalClients.toLocaleString(),
      impression: 0.06,
    },
  ];

  return (
    <Card className="px-4 pb-4">
      <div className="flex min-w-0 items-center justify-between gap-3 py-3">
        <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          Clients
        </h2>
        <Select className="h-8 text-xs">
          <option value="last_week">Last Week</option>
          <option value="last_month">Last Month</option>
          <option value="last_year">Last Year</option>
        </Select>
      </div>

      <p>
        <span className="dark:text-dark-100 text-3xl font-medium text-gray-800">
          {totalClients.toLocaleString()}
        </span>{" "}
        <span className="text-success dark:text-success-lighter text-xs">
          +{growthRate}%
        </span>
      </p>
      <p className="text-xs-plus dark:text-dark-300 mt-0.5 text-gray-400">
        Total Clients
      </p>
      <div className="mt-4 flex justify-between">
        <p className="dark:text-dark-300 text-xs text-gray-400 uppercase">
          Category
        </p>
        <p className="dark:text-dark-300 text-xs text-gray-400 uppercase">
          Count
        </p>
      </div>
      <div className="mt-2 space-y-2.5">
        {visitors.map((visitor) => (
          <div key={visitor.uid} className="flex min-w-0 justify-between gap-4">
            <a href="##" className="truncate hover:underline hover:opacity-80">
              {visitor.name}
            </a>
            <div className="flex items-center gap-1.5">
              <p className="text-sm-plus dark:text-dark-100 text-gray-800">
                {visitor.visits}
              </p>
              {visitor.impression > 0 ? (
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

