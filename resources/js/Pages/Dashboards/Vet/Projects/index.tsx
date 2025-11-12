import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/components/ui";
import { AppointmentCard, DashboardAppointment } from "../TopSellers/AppointmentCard";

// ----------------------------------------------------------------------

type ProjectsProps = {
  appointments: DashboardAppointment[];
};

export function Projects({ appointments }: ProjectsProps) {
  const [items, setItems] = useState<DashboardAppointment[]>(appointments);

  useEffect(() => {
    setItems(appointments);
  }, [appointments]);

  useEffect(() => {
    const handler = () => {
      router.reload({
        only: ["todayAppointments"],
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          const refreshed = (page.props.todayAppointments ?? []) as DashboardAppointment[];
          setItems(refreshed);
        },
      });
    };

    window.addEventListener("appointment:created", handler);
    return () => window.removeEventListener("appointment:created", handler);
  }, []);

  const hasAppointments = items.length > 0;

  return (
    <Card className="col-span-12 py-2">
      <div className="flex min-w-0 items-center justify-between px-4 py-3">
        <h2 className="dark:text-dark-100 min-w-0 font-medium tracking-wide text-gray-800">
          Today&apos;s Appointments
        </h2>
      </div>
      <div className="hide-scrollbar transition-content flex gap-4 overflow-x-auto px-3">
        {hasAppointments ? (
          items.map((appointment) => (
            <AppointmentCard key={appointment.uuid} appointment={appointment} />
          ))
        ) : (
          <p className="py-6 text-sm text-gray-500 dark:text-dark-200">
            No appointments scheduled for today.
          </p>
        )}
      </div>
    </Card>
  );
}
