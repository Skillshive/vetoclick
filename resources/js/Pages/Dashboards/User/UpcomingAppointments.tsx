// Import Dependencies
import { Link } from "@inertiajs/react";
import { CalendarIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card } from "@/components/ui";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";
import { AppointmentCard } from "./AppointmentCard";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

interface UpcomingAppointmentsProps {
  appointments?: Appointment[];
}

export function UpcomingAppointments({ appointments = [] }: UpcomingAppointmentsProps) {
  const { t } = useTranslation();

  // Limit to 5 appointments
  const displayAppointments = appointments.slice(0, 5);

  return (
    <Card className="px-4 pb-4 sm:px-5">
      <div className="flex h-14 min-w-0 items-center justify-between py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          {t("common.user_dashboard.upcoming_appointments") || "Upcoming Appointments"}
        </h2>
        <Link
          href={route("appointments.index")}
          className="border-b border-dotted border-current pb-0.5 text-xs-plus font-medium text-primary-600 outline-hidden transition-colors duration-300 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400/70 dark:focus:text-primary-400/70"
        >
          {t("common.view_all") || "View All"}
        </Link>
      </div>
      <div className="hide-scrollbar transition-content flex gap-4 overflow-x-auto pb-2">
        {displayAppointments.length > 0 ? (
          displayAppointments.map((appointment) => (
            <AppointmentCard key={appointment.uuid} appointment={appointment} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-8 text-center">
            <CalendarIcon className="size-12 text-gray-300 dark:text-dark-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-dark-300">
              {t("common.user_dashboard.no_upcoming_appointments") || "No upcoming appointments"}
            </p>
            <Link
              href={route("appointments.create")}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {t("common.user_dashboard.schedule_appointment") || "Schedule an appointment"}
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
