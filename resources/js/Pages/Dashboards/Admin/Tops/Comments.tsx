// Import Dependencies
import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Card, Select } from "@/components/ui";

// ----------------------------------------------------------------------

// Types
interface Appointment {
  uid: string;
  name: string;
  count: string;
  impression: number;
}

interface CommentsProps {
  stats?: {
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    thisMonthAppointments: number;
  };
}

export function Comments({ stats }: CommentsProps) {
  const totalAppointments = stats?.totalAppointments || 0;
  const todayAppointments = stats?.todayAppointments || 0;
  const pendingAppointments = stats?.pendingAppointments || 0;
  const completedAppointments = stats?.completedAppointments || 0;
  const thisMonthAppointments = stats?.thisMonthAppointments || 0;

  const growthRate = totalAppointments > 0 
    ? ((thisMonthAppointments / totalAppointments) * 100).toFixed(1) 
    : "0";

  const appointments: Appointment[] = [
    {
      uid: "1",
      name: "Today's Appointments",
      count: todayAppointments.toLocaleString(),
      impression: todayAppointments > 0 ? 0.19 : 0,
    },
    {
      uid: "2",
      name: "Pending Appointments",
      count: pendingAppointments.toLocaleString(),
      impression: pendingAppointments > 0 ? 0.01 : 0,
    },
    {
      uid: "3",
      name: "Completed Appointments",
      count: completedAppointments.toLocaleString(),
      impression: completedAppointments > 0 ? 0.08 : 0,
    },
    {
      uid: "4",
      name: "This Month",
      count: thisMonthAppointments.toLocaleString(),
      impression: thisMonthAppointments > 0 ? 0.06 : -0.21,
    },
    {
      uid: "5",
      name: "Total Appointments",
      count: totalAppointments.toLocaleString(),
      impression: totalAppointments > 0 ? 0.06 : 0,
    },
  ];

  return (
    <Card className="px-4 pb-4">
      <div className="flex min-w-0 items-center justify-between gap-3 py-3">
        <h2 className="truncate font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Appointments
        </h2>
        <Select className="h-8 text-xs">
          <option value="last_week">Last Week</option>
          <option value="last_month">Last Month</option>
          <option value="last_year">Last Year</option>
        </Select>
      </div>
      <p>
        <span className="text-3xl font-medium text-gray-800 dark:text-dark-100">
          {totalAppointments.toLocaleString()}
        </span>{" "}
        <span className="text-xs text-success dark:text-success-lighter">
          +{growthRate}%
        </span>
      </p>
      <p className="mt-0.5 text-xs-plus text-gray-400 dark:text-dark-300">
        Total Appointments
      </p>
      <div className="mt-4 flex justify-between">
        <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
          Type
        </p>
        <p className="text-xs uppercase text-gray-400 dark:text-dark-300">
          Count
        </p>
      </div>
      <div className="mt-2 space-y-2.5">
        {appointments.map((appointment) => (
          <div key={appointment.uid} className="flex min-w-0 justify-between gap-4">
            <a href="##" className="truncate hover:underline hover:opacity-80">
              {appointment.name}
            </a>
            <div className="flex items-center gap-1.5">
              <p className="text-sm-plus text-gray-800 dark:text-dark-100">
                {appointment.count}
              </p>
              {appointment.impression > 0 ? (
                <ArrowUpIcon className="this:success size-3 stroke-2 text-this dark:text-this-lighter" />
              ) : (
                <ArrowDownIcon className="this:error size-3 stroke-2 text-this dark:text-this-lighter" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

